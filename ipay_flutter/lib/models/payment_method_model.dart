class PaymentMethodModel {
  final int id;
  final int userId;
  final String type; // ewallet, bank, ipay
  final String provider; // DANA, GOPAY, BCA, IPAY
  final String? identifier;
  final bool isActive;

  PaymentMethodModel({
    required this.id,
    required this.userId,
    required this.type,
    required this.provider,
    this.identifier,
    this.isActive = true,
  });

  factory PaymentMethodModel.fromJson(Map<String, dynamic> json) {
    return PaymentMethodModel(
      id: json['id'] is int ? json['id'] : int.parse(json['id'].toString()),
      userId: json['user_id'] is int ? json['user_id'] : int.parse((json['user_id'] ?? 0).toString()),
      type: json['type'] ?? 'ewallet',
      provider: json['provider'] ?? '',
      identifier: json['identifier'],
      isActive: json['is_active'] == true || json['is_active'] == 1,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'type': type,
      'provider': provider,
      'identifier': identifier,
      'is_active': isActive,
    };
  }
}
