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
        # Detect face in the image using MTCNN
        detections = self.face_detector.detect_faces(image)
        return len(detections) > 0

    def extract_features(self, image_path, side: str) -> np.ndarray:
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
        # Extract features for the input image
        input_image_feature = self.extract_features(input_image_path, 'front')
        if input_image_feature.size == 0:
            return "No valid features extracted from the input image."

        cosine_similarities = []
        weights = []

        # Compare features with stored images
        for stored_image in stored_image_features_list:
            stored_features = np.array(stored_image['features'])
            if stored_features.size == 0:
                continue  # Skip empty feature arrays

            # Compute cosine similarity
            cosine_similarity = np.dot(stored_features, input_image_feature) / (
                np.linalg.norm(stored_features) * np.linalg.norm(input_image_feature))

            cosine_similarities.append(cosine_similarity)
            if stored_image['side'] == 'front':
                weights.append(3)  # Assign higher weight to the front side
            else:
                weights.append(0.02)  # Lower weight for left or right sides

        if not cosine_similarities:
            return False

        # Compute the weighted average of cosine similarities
        weighted_average_similarity = np.average(
            cosine_similarities, weights=weights)

        # Compare the weighted similarity with the threshold
        return weighted_average_similarity > self.threshold
