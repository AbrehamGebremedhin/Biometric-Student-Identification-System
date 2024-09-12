// ignore_for_file: use_build_context_synchronously

import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'register_page.dart';
import 'home.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Demo',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      home: const SplashScreen(),
    );
  }
}

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  // ignore: library_private_types_in_public_api
  _SplashScreenState createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  late SharedPreferences prefs;

  @override
  void initState() {
    super.initState();
    _checkUuid();
  }

  Future<void> _checkUuid() async {
    prefs = await SharedPreferences.getInstance();
    String? uuid = prefs.getString('uuid');

    if (uuid != null) {
      bool isActive = await _checkUuidStatus(uuid);
      if (isActive) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (context) => const SelectionPage()),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
              content: Text(
                  'Application is not active, Please contact the school adminstration.')),
        );
      }
    } else {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => const RegisterPage()),
      );
    }
  }

  Future<bool> _checkUuidStatus(String uuid) async {
    try {
      final response = await http
          .get(
            Uri.parse('http://192.168.0.102:8000/api/v1/check/$uuid'),
          )
          .timeout(const Duration(seconds: 5));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['ACTIVE'];
      } else {
        return false;
      }
    } catch (e) {
      return false;
    }
  }

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(
        child: CircularProgressIndicator(),
      ),
    );
  }
}

class SelectionPage extends StatefulWidget {
  const SelectionPage({super.key});

  @override
  // ignore: library_private_types_in_public_api
  _SelectionPageState createState() => _SelectionPageState();
}

class _SelectionPageState extends State<SelectionPage> {
  String? selectedRoom;
  String? selectedSession;

  List<String> rooms = [
    "LR201",
    "LR202",
    "LR301",
    "LR302",
    "LR303",
    "LR401",
    "LR402",
    "LR601",
    "Library"
  ];
  List<String> sessions = ["Morning 09:00", "Midday 11:00", "Afternoon 02:00"];

  Map<String, String> sessionMapping = {
    "Morning 09:00": "MORNING",
    "Midday 11:00": "MIDDAY",
    "Afternoon 02:00": "AFTERNOON"
  };

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Select Room and Exam Time'),
        centerTitle: true,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            DropdownButtonFormField<String>(
              value: selectedRoom,
              decoration: const InputDecoration(labelText: "Select Room"),
              items: rooms.map((room) {
                return DropdownMenuItem(
                  value: room,
                  child: Text(room),
                );
              }).toList(),
              onChanged: (value) {
                setState(() {
                  selectedRoom = value;
                });
              },
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              value: selectedSession,
              decoration: const InputDecoration(labelText: "Select Session"),
              items: sessions.map((session) {
                return DropdownMenuItem(
                  value: session,
                  child: Text(session),
                );
              }).toList(),
              onChanged: (value) {
                setState(() {
                  selectedSession = value;
                });
              },
            ),
            const SizedBox(height: 32),
            ElevatedButton(
              onPressed: selectedRoom != null && selectedSession != null
                  ? () {
                      // Get the mapped session value
                      String mappedSession = sessionMapping[selectedSession]!;

                      // Navigate to HomePage and pass the selected room and mapped session
                      Navigator.pushReplacement(
                        context,
                        MaterialPageRoute(
                          builder: (context) => HomePage(
                            selectedRoom: selectedRoom!,
                            selectedSession:
                                mappedSession, // Pass the mapped session here
                          ),
                        ),
                      );
                    }
                  : null,
              child: const Text('Proceed'),
            ),
          ],
        ),
      ),
    );
  }
}
