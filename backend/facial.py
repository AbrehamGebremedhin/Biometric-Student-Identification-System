import os
import torch
import numpy as np
import torchvision.transforms as transforms
from PIL import Image
from io import BytesIO
from mtcnn import MTCNN
from torchvision.models import resnet152, ResNet152_Weights

# Suppress TensorFlow logging
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'


class FacialRecognition:
    def __init__(self) -> None:
        """
        Initialize the FacialRecognition class.
        Sets up the ResNet152 model with pre-trained weights,
        defines the preprocessing pipeline, and initializes the face detector.
        """
        # Initialize ResNet152 model with pre-trained weights
        self.model = resnet152(weights=ResNet152_Weights.IMAGENET1K_V2)
        self.model.eval()

        # Define the preprocessing pipeline
        self.preprocess = transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406],
                                 std=[0.229, 0.224, 0.225]),
        ])
        self.threshold = 0.75
        self.face_detector = MTCNN()

    def detect_face(self, image: np.ndarray) -> bool:
        """
        Detect faces in the given image using MTCNN.

        Args:
            image (np.ndarray): The image in which to detect faces.

        Returns:
            bool: True if at least one face is detected, False otherwise.
        """
        # Detect face in the image using MTCNN
        detections = self.face_detector.detect_faces(image)
        return len(detections) > 0

    def extract_features(self, image_path, side: str) -> np.ndarray:
        """
        Extract features from the given image using the pre-trained ResNet model.

        Args:
            image_path (str): The path to the image file.
            side (str): The side of the face to consider ('front' or other).

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

        if side == 'front':
            if not self.detect_face(image_array):
                return np.array([])

        # Preprocess the image
        image_tensor = self.preprocess(image)
        image_tensor = image_tensor.unsqueeze(0)

        try:
            # Extract features using the pre-trained ResNet model
            with torch.no_grad():
                features = self.model(image_tensor)
        except Exception as e:
            return np.array([])

        return features.numpy().flatten()

    def compare_images(self, stored_image_features_list: list[np.ndarray], input_image_path) -> bool:
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
        input_image_feature = self.extract_features(input_image_path, 'front')
        if input_image_feature.size == 0:
            return "No valid features extracted from the input image."

        cosine_similarities = []
        weights = []

        # Compare features with stored images
        for stored_image in stored_image_features_list:
            stored_features = np.array(stored_image['features'])
