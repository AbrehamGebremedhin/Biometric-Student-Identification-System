import os
import torch
import numpy as np
import torchvision.transforms as transforms
from PIL import Image
from io import BytesIO
from mtcnn import MTCNN
# Use FaceNet for better facial embeddings
from facenet_pytorch import InceptionResnetV1

# Suppress TensorFlow logging
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'


class FacialRecognition:
    def __init__(self) -> None:
        """
        Initialize the FacialRecognition class.
        Sets up the FaceNet model with pre-trained weights,
        defines the preprocessing pipeline, and initializes the face detector (MTCNN).
        """
        # Initialize FaceNet model for facial embeddings
        self.model = InceptionResnetV1(pretrained='vggface2').eval()

        # Define the preprocessing pipeline
        self.preprocess = transforms.Compose([
            transforms.Resize(160),  # Resizing to 160x160 for FaceNet
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.5, 0.5, 0.5],
                                 std=[0.5, 0.5, 0.5]),
        ])
        self.threshold = 0.70
        self.face_detector = MTCNN()

    def detect_and_align_face(self, image: np.ndarray) -> np.ndarray:
        """
        Detect and align faces in the given image using MTCNN.

        Args:
            image (np.ndarray): The image in which to detect and align faces.

        Returns:
            np.ndarray: The aligned face as a numpy array.
        """
        # Detect face in the image using MTCNN
        detections = self.face_detector.detect_faces(image)

        if detections is None or len(detections) == 0:
            return None

        # Extract the bounding box of the first detected face
        x, y, width, height = detections[0]['box']
        aligned_face = image[y:y + height, x:x + width]

        return aligned_face

    def extract_features(self, image_path: str, side: str) -> np.ndarray:
        """
        Extract features from the given image using the FaceNet model.

        Args:
            image_path (str): The path to the image file.
            side (str): Indicates the side of the face ('front', 'right' or 'left').

        Returns:
            np.ndarray: The extracted features as a flattened numpy array.
                        Returns an empty array if extraction fails.
        """
        try:
            # Open the image from the file path
            image = Image.open(BytesIO(image_path))
        except IOError:
            return np.array([])  # Return an empty array on failure

        image = image.convert('RGB')
        image_array = np.array(image)

        # Only detect and align the face if the side is 'front'
        if side == 'front':
            aligned_face = self.detect_and_align_face(image_array)
            if aligned_face is None:
                return np.array([])

            # Convert the aligned face (numpy array) back to PIL image
            aligned_face_pil = Image.fromarray(aligned_face)
        else:
            # If the side is not 'front', use the original image without alignment
            aligned_face_pil = image

        # Preprocess the aligned face or original image
        face_tensor = self.preprocess(aligned_face_pil)
        face_tensor = face_tensor.unsqueeze(0)

        try:
            # Extract features using FaceNet
            with torch.no_grad():
                features = self.model(face_tensor)
        except Exception as e:
            return np.array([])

        return features.numpy().flatten()

    def compare_images(self, stored_image_features_list: list[np.ndarray], input_image_path: str) -> bool:
        """
        Compare the input image with a list of stored image features.

        Args:
            stored_image_features_list (list[np.ndarray]): List of stored image features.
            input_image_path (str): The path to the input image file.

        Returns:
            bool: True if the input image matches any of the stored images based on cosine similarity.
                  Returns a message if no valid features are extracted from the input image.
        """
        # Extract features for the input image
        input_image_feature = self.extract_features(
            input_image_path, side='front')
        if input_image_feature.size == 0:
            return "No valid features extracted from the input image."

        cosine_similarities = []
        weights = []

        # Compare features with stored images
        for stored_image in stored_image_features_list:
            stored_features = np.array(stored_image['features'])

            # Compute cosine similarity between stored and input features
            cosine_similarity = np.dot(stored_features, input_image_feature) / (
                np.linalg.norm(stored_features) *
                np.linalg.norm(input_image_feature)
            )
            cosine_similarities.append(cosine_similarity)

            if stored_image['side'] == 'front':
                weight = stored_image.get('weight', 3)
                weights.append(weight)
            else:
                weight = stored_image.get('weight', 0.4)
                weights.append(weight)

        # Normalize weights
        normalized_weights = np.array(weights) / np.sum(weights)

        # Weighted average of cosine similarities
        weighted_avg_similarity = np.dot(
            normalized_weights, cosine_similarities)

        # Return True if similarity exceeds threshold, else False
        return weighted_avg_similarity >= self.threshold
