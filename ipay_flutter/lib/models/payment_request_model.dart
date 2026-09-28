import 'transaction_model.dart';

class PaymentRequestModel {
  final int id;
  final int requesterId;
  final int payerId;
  final double amount;
  final String? description;
  final String? notes;
  final String status; // pending, accepted, rejected, cancelled, expired
  final int transactionId;
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
    required this.transactionId,
    this.expiresAt,
    this.paymentCode,
    this.requester,
    this.payer,
    this.transaction,
    this.createdAt,
  });

  factory PaymentRequestModel.fromJson(Map<String, dynamic> json) {
    // Check if payment code is in transaction.otp_code or json['payment_code']
    String? code = json['payment_code'];
    if (code == null && json['transaction'] != null) {
      code = json['transaction']['otp_code'];
    }

    return PaymentRequestModel(
      id: json['id'] is int ? json['id'] : int.parse(json['id'].toString()),
      requesterId: json['requester_id'] is int
          ? json['requester_id']
          : int.parse((json['requester_id'] ?? 0).toString()),
      payerId: json['payer_id'] is int
          ? json['payer_id']
          : int.parse((json['payer_id'] ?? 0).toString()),
      amount: json['amount'] != null
          ? double.tryParse(json['amount'].toString()) ?? 0.0
          : 0.0,
      description: json['description'],
      notes: json['notes'],
      status: json['status'] ?? 'pending',
      transactionId: json['transaction_id'] is int
          ? json['transaction_id']
          : int.parse((json['transaction_id'] ?? 0).toString()),
      expiresAt: json['expires_at'],
      paymentCode: code,
      requester: json['requester'] != null
          ? TransactionUser.fromJson(json['requester'])
          : null,
      payer:
          json['payer'] != null ? TransactionUser.fromJson(json['payer']) : null,
      transaction: json['transaction'] != null
          ? TransactionModel.fromJson(json['transaction'])
          : null,
      createdAt: json['created_at'],
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
