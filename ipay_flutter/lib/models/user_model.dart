import 'dart:convert';

class UserModel {
  final int id;
  final String name;
  final String? email;
  final String? phone;
  final String ipayId;
  final double balance;
  final bool isActive;
  final String? createdAt;

  UserModel({
    required this.id,
    required this.name,
    this.email,
    this.phone,
    required this.ipayId,
    required this.balance,
    this.isActive = true,
    this.createdAt,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] is int ? json['id'] : int.parse(json['id'].toString()),
      name: json['name'] ?? '',
      email: json['email'],
      phone: json['phone'],
      ipayId: json['ipay_id'] ?? json['ipayId'] ?? '',
      balance: json['balance'] != null
          ? double.tryParse(json['balance'].toString()) ?? 0.0
          : 0.0,
      isActive: json['is_active'] == true || json['is_active'] == 1 || json['is_active'] == null,
      createdAt: json['created_at'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'phone': phone,
      'ipay_id': ipayId,
      'balance': balance,
      'is_active': isActive,
      'created_at': createdAt,
    };
  }

  String toRawJson() => json.encode(toJson());

  factory UserModel.fromRawJson(String str) =>
      UserModel.fromJson(json.decode(str));

  UserModel copyWith({
    int? id,
    String? name,
    String? email,
    String? phone,
    String? ipayId,
    double? balance,
    bool? isActive,
    String? createdAt,
  }) {
    return UserModel(
      id: id ?? this.id,
      name: name ?? this.name,
      email: email ?? this.email,
      phone: phone ?? this.phone,
      ipayId: ipayId ?? this.ipayId,
      balance: balance ?? this.balance,
      isActive: isActive ?? this.isActive,
      createdAt: createdAt ?? this.createdAt,
    );
  }
}
