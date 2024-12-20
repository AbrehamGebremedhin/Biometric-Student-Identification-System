import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:image/image.dart' as img; // Import the image package
import 'result_page.dart';

class CameraPage extends StatefulWidget {
  final String selectedRoom;
  final String selectedSession;

  const CameraPage(
      {super.key, required this.selectedRoom, required this.selectedSession});

  @override
  // ignore: library_private_types_in_public_api
  _CameraPageState createState() => _CameraPageState();
}

class _CameraPageState extends State<CameraPage> {
  File? _image;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _pickImage();
  }

  Future<void> _pickImage() async {
    final picker = ImagePicker();
    final pickedFile = await picker.pickImage(source: ImageSource.camera);

    if (pickedFile != null) {
      setState(() {
        _image = File(pickedFile.path);
        _isLoading = true;
      });

      // Compress the image before sending
      File? compressedImage = await _compressImage(_image!);

      if (compressedImage != null) {
        await _uploadImage(compressedImage);
      }
    }
  }

  Future<File?> _compressImage(File imageFile) async {
    try {
      // Read the image from the file
      final originalImage = img.decodeImage(imageFile.readAsBytesSync());

      if (originalImage == null) return null;

      // Resize and compress the image (adjust width and height as needed)
      final resizedImage = img.copyResize(originalImage,
          width: 800); // Resize to a width of 800px (adjust if needed)

      // Save the compressed image to a temporary file
      final compressedImage = File('${imageFile.path}_compressed.jpg')
        ..writeAsBytesSync(img.encodeJpg(resizedImage,
            quality: 85)); // Adjust the quality (85% in this case)

      return compressedImage;
    } catch (e) {
      return null;
    }
  }

  Future<void> _uploadImage(File image) async {
    setState(() {
      _isLoading = true;
    });

    final request = http.MultipartRequest(
      'PATCH',
      Uri.parse(
          'http://192.168.81.208:8000/api/v1/attendances/?room_no=${widget.selectedRoom}&exam_time=${widget.selectedSession}'),
    );
    request.files
        .add(await http.MultipartFile.fromPath('input_image', image.path));

    final response = await request.send();

    setState(() {
      _isLoading = false;
    });

    final responseBody = await response.stream.bytesToString();
    final responseData = jsonDecode(responseBody);

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => ResultsPage(
          statusCode: response.statusCode,
          image: _image!,
          responseData: responseData,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Camera Page'),
      ),
      body: Center(
        child: _isLoading
            ? const Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  CircularProgressIndicator(),
                  SizedBox(height: 16),
                  Text('Recognizing...'),
                ],
              )
            : _image == null
                ? const CircularProgressIndicator()
                : Image.file(_image!),
      ),
    );
  }
}
