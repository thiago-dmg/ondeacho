import "package:flutter_riverpod/flutter_riverpod.dart";
import "package:go_router/go_router.dart";
import "../../features/auth/login_page.dart";
import "../../features/auth/profile_page.dart";
import "../../features/auth/auth_state.dart";
import "../../features/contacts/my_contacts_page.dart";
import "../../features/collaboration/edit_owned_clinic_page.dart";
import "../../features/collaboration/profile_claim_page.dart";
import "../../features/collaboration/suggest_clinic_page.dart";
import "../../features/discovery/discovery_page.dart";
import "../../features/favorites/favorites_page.dart";
import "../../features/listing_details/listing_details_page.dart";
import "../../features/reviews/clinic_reviews_page.dart";

final appRouterProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authStateProvider);
  const privateRoutes = {"/favorites", "/my-contacts", "/profile"};
  return GoRouter(
    initialLocation: "/discovery",
    redirect: (context, state) {
      final loggedIn = authState.token != null;
      final inLogin = state.matchedLocation == "/login";
      final isPrivate = privateRoutes.contains(state.matchedLocation);

      if (!loggedIn && isPrivate) {
        final from = Uri.encodeComponent(state.uri.toString());
        return "/login?from=$from";
      }

      if (loggedIn && inLogin) {
        final from = state.uri.queryParameters["from"];
        if (from != null && from.isNotEmpty) {
          return Uri.decodeComponent(from);
        }
        return "/discovery";
      }

      return null;
    },
    routes: [
      GoRoute(
        path: "/login",
        builder: (context, state) => const LoginPage()
      ),
      GoRoute(
        path: "/discovery",
        builder: (context, state) => const DiscoveryPage()
      ),
      GoRoute(
        path: "/favorites",
        builder: (context, state) => const FavoritesPage()
      ),
      GoRoute(
        path: "/my-contacts",
        builder: (context, state) => const MyContactsPage()
      ),
      GoRoute(
        path: "/profile",
        builder: (context, state) => const ProfilePage()
      ),
      GoRoute(
        path: "/listing/:id/reviews",
        builder: (context, state) => ClinicReviewsPage(
          listingId: state.pathParameters["id"] ?? "",
          clinicName: state.uri.queryParameters["name"] ?? "Clínica"
        )
      ),
      GoRoute(
        path: "/listing/:id",
        builder: (context, state) => ListingDetailsPage(
          listingId: state.pathParameters["id"] ?? ""
        )
      ),
      GoRoute(
        path: "/suggest",
        builder: (context, state) => const SuggestClinicPage()
      ),
      GoRoute(
        path: "/claim/:clinicId",
        builder: (context, state) => ProfileClaimPage(
          clinicId: state.pathParameters["clinicId"] ?? "",
          clinicName: state.uri.queryParameters["name"] ?? "Perfil"
        )
      ),
      GoRoute(
        path: "/owner/clinic/:clinicId/edit",
        builder: (context, state) => EditOwnedClinicPage(
          clinicId: state.pathParameters["clinicId"] ?? "",
          clinicName: state.uri.queryParameters["name"] ?? "",
          addressLine: state.uri.queryParameters["addressLine"],
          phone: state.uri.queryParameters["phone"],
          whatsappPhone: state.uri.queryParameters["whatsappPhone"]
        )
      )
    ]
  );
});
