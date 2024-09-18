import 'package:flutter/material.dart';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'dart:convert';

class CheckStudentResultPage extends StatefulWidget {
  final File image;

  const CheckStudentResultPage({super.key, required this.image});

  @override
  // ignore: library_private_types_in_public_api
  _CheckStudentResultPageState createState() => _CheckStudentResultPageState();
}

class _CheckStudentResultPageState extends State<CheckStudentResultPage> {
  late Future<Map<String, dynamic>> _studentData;

  @override
  void initState() {
    super.initState();
    _studentData = _checkStudent();
  }

  Future<Map<String, dynamic>> _checkStudent() async {
    final request = http.MultipartRequest(
      'GET',
      Uri.parse('http://192.168.81.208:8000/api/v1/searchStudent/'),
    );
    request.files.add(
        await http.MultipartFile.fromPath('input_image', widget.image.path));

    final response = await request.send();
    final responseBody = await response.stream.bytesToString();
    final responseData = jsonDecode(responseBody);

    if (response.statusCode == 202) {
      return responseData;
    } else {
      throw Exception('Failed to load student data');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Student Results')),
      body: FutureBuilder<Map<String, dynamic>>(
        future: _studentData,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          } else if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          } else if (snapshot.hasData) {
            final studentData = snapshot.data!;
            return Padding(
              padding: const EdgeInsets.all(16.0),
              child: ListView(
                children: [
                  Card(
                    child: ListTile(
                      title: Text('Name: ${studentData['student_name']}'),
                      subtitle: Text('ID: ${studentData['student_id']}'),
                    ),
                  ),
                  Card(
                    child: ListTile(
                      title: Text('Batch: ${studentData['student_batch']}'),
                    ),
                  ),
                ],
              ),
            );
          } else {
            return const Center(child: Text('Unexpected error occurred.'));
          }
        },
      ),
    );
  }
}
