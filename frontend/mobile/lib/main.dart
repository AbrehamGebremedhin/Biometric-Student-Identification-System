import 'package:flutter/material.dart';
import 'home.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Biometric Student Identification System',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      home: const SelectionPage(),
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
                      // Navigate to HomePage and pass the selected values
                      Navigator.pushReplacement(
                        context,
                        MaterialPageRoute(
                          builder: (context) => HomePage(
                            selectedRoom: selectedRoom!,
                            selectedSession: selectedSession!,
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
