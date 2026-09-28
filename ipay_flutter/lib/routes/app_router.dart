import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../models/transaction_model.dart';
import '../providers/auth_provider.dart';
import '../screens/auth/login_screen.dart';
import '../screens/auth/register_screen.dart';
import '../screens/history/transaction_detail_screen.dart';
import '../screens/main_navigation_screen.dart';
import '../screens/payment/pay_bills_screen.dart';
import '../screens/payment/pay_direct_screen.dart';
import '../screens/payment/payment_request_screen.dart';
import '../screens/profile/change_pin_screen.dart';
import '../screens/profile/edit_profile_screen.dart';
import '../screens/qr/my_qr_screen.dart';
import '../screens/qr/scan_qr_screen.dart';
import '../screens/topup/topup_screen.dart';
import '../screens/transfer/transfer_screen.dart';

class AppRouter {
  static GoRouter router(AuthProvider authProvider) {
    return GoRouter(
      initialLocation: '/home',
      refreshListenable: authProvider,
      redirect: (BuildContext context, GoRouterState state) {
        final status = authProvider.status;

        if (status == AuthStatus.uninitialized) {
          return null; // Stay on splash / current route while loading auth check
        }

        final isLoggingIn = state.matchedLocation == '/login' ||
            state.matchedLocation == '/register';

        if (status == AuthStatus.unauthenticated) {
          return isLoggingIn ? null : '/login';
        }

        if (status == AuthStatus.authenticated && isLoggingIn) {
          return '/home';
        }

        return null;
      },
      routes: [
        GoRoute(
          path: '/login',
          builder: (context, state) => const LoginScreen(),
        ),
        GoRoute(
          path: '/register',
          builder: (context, state) => const RegisterScreen(),
        ),
        GoRoute(
          path: '/home',
          builder: (context, state) => const MainNavigationScreen(initialIndex: 0),
        ),
        GoRoute(
          path: '/history',
          builder: (context, state) => const MainNavigationScreen(initialIndex: 1),
          routes: [
            GoRoute(
              path: 'detail',
              builder: (context, state) {
                final txn = state.extra as TransactionModel;
                return TransactionDetailScreen(transaction: txn);
              },
            ),
          ],
        ),
        GoRoute(
          path: '/transfer',
          builder: (context, state) {
            final ipayId = state.uri.queryParameters['ipay_id'];
            return TransferScreen(initialIpayId: ipayId);
          },
        ),
        GoRoute(
          path: '/topup',
          builder: (context, state) => const TopUpScreen(),
        ),
        GoRoute(
          path: '/payment-request',
          builder: (context, state) => const PaymentRequestScreen(),
        ),
        GoRoute(
          path: '/pay-bills',
          builder: (context, state) => const PayBillsScreen(),
        ),
        GoRoute(
          path: '/pay-direct',
          builder: (context, state) {
            final code = state.uri.queryParameters['code'];
            return PayDirectScreen(initialCode: code);
          },
        ),
        GoRoute(
          path: '/my-qr',
          builder: (context, state) => const MyQrScreen(),
        ),
        GoRoute(
          path: '/scan-qr',
          builder: (context, state) => const ScanQrScreen(),
        ),
        GoRoute(
          path: '/profile',
          builder: (context, state) => const MainNavigationScreen(initialIndex: 3),
          routes: [
            GoRoute(
              path: 'edit',
              builder: (context, state) => const EditProfileScreen(),
            ),
            GoRoute(
              path: 'change-pin',
              builder: (context, state) => const ChangePinScreen(),
            ),
          ],
        ),
      ],
    );
  }
}
