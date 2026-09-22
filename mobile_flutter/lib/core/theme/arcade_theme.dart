import 'package:flutter/material.dart';

class ArcadeTheme {
  static const Color darkBg = Color(0xFF0A0C14);
  static const Color cardBg = Color(0xFF121626);
  static const Color elevatedBg = Color(0xFF1A1E36);
  
  static const Color neonCyan = Color(0xFF00F5D4);
  static const Color neonPink = Color(0xFFFF007F);
  static const Color neonPurple = Color(0xFF7928CA);
  static const Color neonGold = Color(0xFFFFD166);
  static const Color neonGreen = Color(0xFF10B981);

  static ThemeData get themeData {
    return ThemeData(
      brightness: Brightness.dark,
      scaffoldBackgroundColor: darkBg,
      primaryColor: neonCyan,
      cardColor: cardBg,
      fontFamily: 'Roboto',
      appBarTheme: const AppBarTheme(
        backgroundColor: darkBg,
        elevation: 0,
        centerTitle: true,
        titleTextStyle: TextStyle(
          color: Colors.white,
          fontSize: 18,
          fontWeight: FontWeight.bold,
          letterSpacing: 1.2,
        ),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: Color(0xFF0A0C14),
        selectedItemColor: neonCyan,
        unselectedItemColor: Colors.grey,
        elevation: 10,
      ),
    );
  }
}
