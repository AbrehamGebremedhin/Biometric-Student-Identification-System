// ignore_for_file: use_build_context_synchronously

import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'main.dart';

class RegisterPage extends StatefulWidget {
  const RegisterPage({super.key});

  @override
  // ignore: library_private_types_in_public_api
  _RegisterPageState createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage> {
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();
  String? _examinerName;
  String? _examinerPhone;
  late SharedPreferences prefs;

  @override
  void initState() {
    super.initState();
    _initializePrefs();
  }

  Future<void> _initializePrefs() async {
    prefs = await SharedPreferences.getInstance();
  }

  Future<bool> _checkUrlAccessibility(String url) async {
    try {
      final response =
          await http.get(Uri.parse(url)).timeout(const Duration(seconds: 5));
      return response.statusCode == 200;
    } catch (e) {
      return false;
    }
  }

  Future<Map<String, dynamic>> _sendRegistrationData(
      String name, String phone) async {
    try {
      final response = await http
          .post(
        Uri.parse(
            'http://192.168.81.208:8000/api/v1/examiners/'), // Use '10.0.2.2' for Android emulator, replace with actual IP for real device
        headers: <String, String>{
          'Content-Type': 'application/json; charset=UTF-8',
        },
        body: jsonEncode(<String, String>{
          'EXAMINER_NAME': name,
          'EXAMINER_PHONE': phone,
        }),
      )
          .timeout(const Duration(seconds: 10), onTimeout: () {
        throw Exception('Connection timed out');
      });

      if (response.statusCode == 201) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Failed to register: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Registration error: $e');
    }
  }

  Future<void> _register() async {
    if (_formKey.currentState!.validate()) {
      _formKey.currentState!.save();

      const url = 'http://192.168.81.208:8000/api/v1/examiners/';

      if (await _checkUrlAccessibility(url)) {
        try {
          final responseData =
              await _sendRegistrationData(_examinerName!, _examinerPhone!);

          if (!mounted) return;

          // Store the ID permanently using SharedPreferences
          final prefs = await SharedPreferences.getInstance();
          await prefs.setString('uuid', responseData['id']);

          // Navigate to MyHomePage or show success message
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(builder: (context) => const SelectionPage()),
          );
        } catch (e) {
          // Handle error response
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Registration failed: $e')),
          );
        }
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Cannot access the registration URL')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Register'),
      ),
      body: Form(
        key: _formKey,
        child: Column(
          children: <Widget>[
            TextFormField(
              decoration: const InputDecoration(labelText: 'Name'),
              onSaved: (value) {
                _examinerName = value;
              },
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Please enter your name';
                }
                return null;
              },
            ),
            TextFormField(
              decoration: const InputDecoration(labelText: 'Phone'),
              onSaved: (value) {
                _examinerPhone = value;
              },
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Please enter your phone number';
                }
                return null;
              },
            ),
            ElevatedButton(
              onPressed: _register,
              child: const Text('Register'),
            ),
          ],
        ),
      ),
    );
  }
}
