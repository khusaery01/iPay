import 'payment_method_model.dart';

class TransactionUser {
  final int id;
  final String name;
  final String ipayId;
  final String? phone;

  TransactionUser({
    required this.id,
    required this.name,
    required this.ipayId,
    this.phone,
  });

  factory TransactionUser.fromJson(Map<String, dynamic> json) {
    return TransactionUser(
      id: json['id'] is int ? json['id'] : int.parse(json['id'].toString()),
      name: json['name'] ?? '',
      ipayId: json['ipay_id'] ?? json['ipayId'] ?? '',
      phone: json['phone'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'ipay_id': ipayId,
      'phone': phone,
    };
  }
}

class TransactionModel {
  final int id;
  final String transactionCode;
  final String type; // transfer, topup, payment
  final int? senderId;
  final int? receiverId;
  final double amount;
  final double fee;
  final int? paymentMethodId;
  final String? description;
  final String status; // pending, success, failed, cancelled, expired
  final String? otpCode; // payment_code
  final String? direction; // in / out
  final TransactionUser? sender;
  final TransactionUser? receiver;
  final PaymentMethodModel? paymentMethod;
  final String? createdAt;
  final String? completedAt;

  TransactionModel({
    required this.id,
    required this.transactionCode,
    required this.type,
    this.senderId,
    this.receiverId,
    required this.amount,
    this.fee = 0.0,
    this.paymentMethodId,
    this.description,
    required this.status,
    this.otpCode,
    this.direction,
    this.sender,
    this.receiver,
    this.paymentMethod,
    this.createdAt,
    this.completedAt,
  });

  factory TransactionModel.fromJson(Map<String, dynamic> json) {
    return TransactionModel(
      id: json['id'] is int ? json['id'] : int.parse(json['id'].toString()),
      transactionCode: json['transaction_code'] ?? json['transactionCode'] ?? '',
      type: json['type'] ?? 'transfer',
      senderId: json['sender_id'] != null ? (json['sender_id'] is int ? json['sender_id'] : int.tryParse(json['sender_id'].toString())) : null,
      receiverId: json['receiver_id'] != null ? (json['receiver_id'] is int ? json['receiver_id'] : int.tryParse(json['receiver_id'].toString())) : null,
      amount: json['amount'] != null ? double.tryParse(json['amount'].toString()) ?? 0.0 : 0.0,
      fee: json['fee'] != null ? double.tryParse(json['fee'].toString()) ?? 0.0 : 0.0,
      paymentMethodId: json['payment_method_id'] != null ? (json['payment_method_id'] is int ? json['payment_method_id'] : int.tryParse(json['payment_method_id'].toString())) : null,
      description: json['description'],
      status: json['status'] ?? 'pending',
      otpCode: json['otp_code'] ?? json['payment_code'],
      direction: json['direction'],
      sender: json['sender'] != null ? TransactionUser.fromJson(json['sender']) : null,
      receiver: json['receiver'] != null ? TransactionUser.fromJson(json['receiver']) : null,
      paymentMethod: json['payment_method'] != null ? PaymentMethodModel.fromJson(json['payment_method']) : null,
      createdAt: json['created_at'],
      completedAt: json['completed_at'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'transaction_code': transactionCode,
      'type': type,
      'sender_id': senderId,
      'receiver_id': receiverId,
      'amount': amount,
      'fee': fee,
      'payment_method_id': paymentMethodId,
      'description': description,
      'status': status,
      'otp_code': otpCode,
      'direction': direction,
      'sender': sender?.toJson(),
      'receiver': receiver?.toJson(),
      'payment_method': paymentMethod?.toJson(),
      'created_at': createdAt,
      'completed_at': completedAt,
    };
  }
}
