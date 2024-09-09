import os
import torch
import logging
import numpy as np
import torchvision.transforms as transforms
from PIL import Image
from io import BytesIO
from mtcnn import MTCNN
from torchvision.models import resnet152, ResNet152_Weights
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'


logging.basicConfig(level=logging.INFO)


class FacialRecognition:
    def __init__(self) -> None:
        self.model = resnet152(weights=ResNet152_Weights.IMAGENET1K_V2)
        self.model.eval()
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
        # Detect face in the image
        detections = self.face_detector.detect_faces(image)
        return len(detections) > 0

    def extract_features(self, image_path, side: str) -> np.ndarray:
        try:
            image = Image.open(BytesIO(image_path))
        except IOError as e:
            return np.array([])

        if side == 'front':
            if not self.detect_face(np.array(image.convert('RGB'))[:, :, ::-1].copy()):
                return "No face detected"

        image = self.preprocess(image)
        image = image.unsqueeze(0)

        try:
            with torch.no_grad():
                features = self.model(image)
        except Exception as e:
            return np.array([])

        return features.numpy().flatten()

    def compare_images(self, stored_image_features_list: list[np.ndarray], input_image_path) -> bool:
        input_image_feature = self.extract_features(input_image_path, 'front')
        if isinstance(input_image_feature, str):
            return False

        cosine_similarities = []
        weights = []
        for stored_image in stored_image_features_list:
            cosine_similarity = np.dot(np.array(stored_image['features']), input_image_feature) / (
                np.linalg.norm(np.array(stored_image['features'])) * np.linalg.norm(input_image_feature))

            cosine_similarities.append(cosine_similarity)
            if stored_image['side'] == 'front':
                weights.append(3)  # Assign higher weight to the front side
            else:
                # Assign normal weight to left and right sides
                weights.append(0.02)

        weighted_average_similarity = np.average(
            cosine_similarities, weights=weights)

        return weighted_average_similarity > self.threshold
