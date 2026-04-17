import "package:flutter/material.dart";
import "package:flutter/services.dart";
import "package:google_fonts/google_fonts.dart";
import "app_colors.dart";
import "app_dimensions.dart";

class AppTheme {
  static ThemeData get light {
    final outline = AppColors.neutral.withValues(alpha: 0.35);
    final baseText = GoogleFonts.interTextTheme();

    final textTheme = baseText.copyWith(
      displaySmall: baseText.displaySmall?.copyWith(
        fontSize: 24,
        fontWeight: FontWeight.w700,
        color: AppColors.textPrimary,
        letterSpacing: -0.3
      ),
      titleLarge: baseText.titleLarge?.copyWith(
        fontSize: 22,
        fontWeight: FontWeight.w700,
        color: AppColors.textPrimary
      ),
      titleMedium: baseText.titleMedium?.copyWith(
        fontSize: 17,
        fontWeight: FontWeight.w600,
        color: AppColors.textPrimary
      ),
      titleSmall: baseText.titleSmall?.copyWith(
        fontSize: 15,
        fontWeight: FontWeight.w600,
        color: AppColors.textPrimary
      ),
      bodyLarge: baseText.bodyLarge?.copyWith(
        fontSize: 16,
        fontWeight: FontWeight.w400,
        color: AppColors.textPrimary,
        height: 1.45
      ),
      bodyMedium: baseText.bodyMedium?.copyWith(
        fontSize: 15,
        fontWeight: FontWeight.w400,
        color: AppColors.textPrimary,
        height: 1.45
      ),
      bodySmall: baseText.bodySmall?.copyWith(
        fontSize: 13,
        fontWeight: FontWeight.w400,
        color: AppColors.textSecondary,
        height: 1.4
      ),
      labelLarge: baseText.labelLarge?.copyWith(
        fontSize: 15,
        fontWeight: FontWeight.w600,
        letterSpacing: 0.1
      ),
      labelSmall: baseText.labelSmall?.copyWith(
        fontSize: 12,
        fontWeight: FontWeight.w500,
        color: AppColors.textSecondary
      )
    );

    final colorScheme = ColorScheme.light(
      primary: AppColors.primary,
      onPrimary: Colors.white,
      primaryContainer: AppColors.primary.withValues(alpha: 0.12),
      secondary: AppColors.secondary,
      onSecondary: Colors.white,
      tertiary: AppColors.accent,
      onTertiary: Colors.white,
      surface: AppColors.card,
      onSurface: AppColors.textPrimary,
      onSurfaceVariant: AppColors.textSecondary,
      outline: outline,
      error: const Color(0xFFDC2626),
      onError: Colors.white
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: colorScheme,
      scaffoldBackgroundColor: AppColors.background,
      textTheme: textTheme,
      splashColor: AppColors.primary.withValues(alpha: 0.08),
      highlightColor: AppColors.primary.withValues(alpha: 0.06),
      dividerColor: AppColors.divider,
      appBarTheme: AppBarTheme(
        elevation: 0,
        scrolledUnderElevation: 0.5,
        centerTitle: false,
        titleSpacing: 20,
        toolbarHeight: 56,
        backgroundColor: AppColors.background,
        foregroundColor: AppColors.textPrimary,
        surfaceTintColor: Colors.transparent,
        systemOverlayStyle: SystemUiOverlayStyle.dark.copyWith(
          statusBarColor: Colors.transparent,
          statusBarIconBrightness: Brightness.dark
        ),
        titleTextStyle: GoogleFonts.inter(
          fontSize: 20,
          fontWeight: FontWeight.w700,
          color: AppColors.textPrimary
        ),
        iconTheme: const IconThemeData(color: AppColors.textPrimary, size: 22),
        actionsIconTheme: const IconThemeData(color: AppColors.textPrimary, size: 22)
      ),
      cardTheme: CardThemeData(
        color: AppColors.card,
        elevation: 0,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppDim.radiusCard)),
        shadowColor: AppColors.shadow,
        margin: EdgeInsets.zero
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          disabledBackgroundColor: AppColors.neutral.withValues(alpha: 0.35),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppDim.radiusButton)),
          elevation: 0,
          textStyle: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.w600)
        )
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.primary,
          side: const BorderSide(color: AppColors.primary, width: 1.2),
          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppDim.radiusButton)),
          textStyle: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.w600)
        )
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: AppColors.accent,
          textStyle: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w600)
        )
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.card,
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
        hintStyle: GoogleFonts.inter(color: AppColors.textSecondary, fontSize: 15),
        labelStyle: GoogleFonts.inter(color: AppColors.textSecondary, fontSize: 14),
        floatingLabelStyle: GoogleFonts.inter(color: AppColors.primary, fontWeight: FontWeight.w600),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppDim.radiusInput),
          borderSide: BorderSide(color: outline)
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppDim.radiusInput),
          borderSide: BorderSide(color: outline)
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppDim.radiusInput),
          borderSide: const BorderSide(color: AppColors.primary, width: 2)
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppDim.radiusInput),
          borderSide: const BorderSide(color: Color(0xFFDC2626), width: 1.2)
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppDim.radiusInput),
          borderSide: const BorderSide(color: Color(0xFFDC2626), width: 2)
        )
      ),
      chipTheme: ChipThemeData(
        backgroundColor: AppColors.neutralBadgeBg,
        labelStyle: GoogleFonts.inter(
          fontSize: 12,
          fontWeight: FontWeight.w600,
          color: AppColors.neutralBadgeFg
        ),
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        side: BorderSide.none
      ),
      bottomSheetTheme: const BottomSheetThemeData(
        backgroundColor: AppColors.card,
        surfaceTintColor: Colors.transparent
      ),
      dialogTheme: DialogThemeData(
        backgroundColor: AppColors.card,
        surfaceTintColor: Colors.transparent,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppDim.radiusCard))
      ),
      snackBarTheme: SnackBarThemeData(
        behavior: SnackBarBehavior.floating,
        backgroundColor: AppColors.textPrimary,
        contentTextStyle: GoogleFonts.inter(color: Colors.white, fontSize: 14),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))
      ),
      iconTheme: const IconThemeData(color: AppColors.textPrimary, size: 22),
      listTileTheme: ListTileThemeData(
        iconColor: AppColors.textSecondary,
        textColor: AppColors.textPrimary,
        titleTextStyle: GoogleFonts.inter(
          fontSize: 16,
          fontWeight: FontWeight.w600,
          color: AppColors.textPrimary
        ),
        subtitleTextStyle: GoogleFonts.inter(fontSize: 14, color: AppColors.textSecondary)
      )
    );
  }
}
