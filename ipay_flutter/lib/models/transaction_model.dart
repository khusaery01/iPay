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
      id: json['id'] is int ? json['id'] : int.tryParse((json['id'] ?? '0').toString()) ?? 0,
      name: json['name']?.toString() ?? '',
      ipayId: json['ipay_id']?.toString() ?? json['ipayId']?.toString() ?? '',
      phone: json['phone']?.toString(),
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
      id: json['id'] is int ? json['id'] : int.tryParse((json['id'] ?? '0').toString()) ?? 0,
      transactionCode: json['transaction_code']?.toString() ?? json['transactionCode']?.toString() ?? '',
      type: json['type']?.toString() ?? 'transfer',
      senderId: json['sender_id'] != null ? (json['sender_id'] is int ? json['sender_id'] : int.tryParse(json['sender_id'].toString())) : null,
      receiverId: json['receiver_id'] != null ? (json['receiver_id'] is int ? json['receiver_id'] : int.tryParse(json['receiver_id'].toString())) : null,
      amount: json['amount'] != null ? double.tryParse(json['amount'].toString()) ?? 0.0 : 0.0,
      fee: json['fee'] != null ? double.tryParse(json['fee'].toString()) ?? 0.0 : 0.0,
      paymentMethodId: json['payment_method_id'] != null ? (json['payment_method_id'] is int ? json['payment_method_id'] : int.tryParse(json['payment_method_id'].toString())) : null,
      description: json['description']?.toString(),
      status: json['status']?.toString() ?? 'pending',
      otpCode: json['otp_code']?.toString() ?? json['payment_code']?.toString(),
      direction: json['direction']?.toString(),
      sender: json['sender'] != null && json['sender'] is Map
          ? TransactionUser.fromJson(Map<String, dynamic>.from(json['sender'] as Map))
          : null,
      receiver: json['receiver'] != null && json['receiver'] is Map
          ? TransactionUser.fromJson(Map<String, dynamic>.from(json['receiver'] as Map))
          : null,
      paymentMethod: json['payment_method'] != null && json['payment_method'] is Map
          ? PaymentMethodModel.fromJson(Map<String, dynamic>.from(json['payment_method'] as Map))
          : null,
      createdAt: json['created_at']?.toString(),
      completedAt: json['completed_at']?.toString(),
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
