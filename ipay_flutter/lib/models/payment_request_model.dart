import 'transaction_model.dart';

class PaymentRequestModel {
  final int id;
  final int requesterId;
  final int payerId;
  final double amount;
  final String? description;
  final String? notes;
  final String status; // pending, accepted, rejected, cancelled, expired
  final int? transactionId;
  final String? expiresAt;
  final String? paymentCode;
  final TransactionUser? requester;
  final TransactionUser? payer;
  final TransactionModel? transaction;
  final String? createdAt;

  PaymentRequestModel({
    required this.id,
    required this.requesterId,
    required this.payerId,
    required this.amount,
    this.description,
    this.notes,
    required this.status,
    this.transactionId,
    this.expiresAt,
    this.paymentCode,
    this.requester,
    this.payer,
    this.transaction,
    this.createdAt,
  });

  factory PaymentRequestModel.fromJson(Map<String, dynamic> json) {
    // Check if payment code is in transaction.otp_code or json['payment_code']
    String? code = json['payment_code']?.toString();
    if (code == null && json['transaction'] != null && json['transaction'] is Map) {
      code = json['transaction']['otp_code']?.toString();
    }

    return PaymentRequestModel(
      id: json['id'] is int ? json['id'] : int.tryParse(json['id']?.toString() ?? '0') ?? 0,
      requesterId: json['requester_id'] is int
          ? json['requester_id']
          : int.tryParse((json['requester_id'] ?? 0).toString()) ?? 0,
      payerId: json['payer_id'] is int
          ? json['payer_id']
          : int.tryParse((json['payer_id'] ?? 0).toString()) ?? 0,
      amount: json['amount'] != null
          ? double.tryParse(json['amount'].toString()) ?? 0.0
          : 0.0,
      description: json['description']?.toString(),
      notes: json['notes']?.toString(),
      status: json['status']?.toString() ?? 'pending',
      transactionId: json['transaction_id'] != null
          ? (json['transaction_id'] is int
              ? json['transaction_id']
              : int.tryParse(json['transaction_id'].toString()))
          : null,
      expiresAt: json['expires_at']?.toString(),
      paymentCode: code,
      requester: json['requester'] != null && json['requester'] is Map
          ? TransactionUser.fromJson(Map<String, dynamic>.from(json['requester'] as Map))
          : null,
      payer: json['payer'] != null && json['payer'] is Map
          ? TransactionUser.fromJson(Map<String, dynamic>.from(json['payer'] as Map))
          : null,
      transaction: json['transaction'] != null && json['transaction'] is Map
          ? TransactionModel.fromJson(Map<String, dynamic>.from(json['transaction'] as Map))
          : null,
      createdAt: json['created_at']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'requester_id': requesterId,
      'payer_id': payerId,
      'amount': amount,
      'description': description,
      'notes': notes,
      'status': status,
      'transaction_id': transactionId,
      'expires_at': expiresAt,
      'payment_code': paymentCode,
      'requester': requester?.toJson(),
      'payer': payer?.toJson(),
      'transaction': transaction?.toJson(),
      'created_at': createdAt,
    };
  }
}
