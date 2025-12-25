"""
Simple accuracy test with clear output
"""
import requests
import json

API_URL = "http://127.0.0.1:5000/api/classify"

test_cases = [
    # POSITIF (10 cases)
    {"text": "Pelayanan di restoran ini sangat memuaskan, makanannya lezat dan pelayannya ramah.", "expected": "Positif"},
    {"text": "Aplikasi ini sangat membantu pekerjaan saya, fiturnya lengkap dan mudah digunakan.", "expected": "Positif"},
    {"text": "Suka banget sama produk ini, kualitasnya oke punya!", "expected": "Positif"},
    {"text": "Pengalaman berbelanja di sini luar biasa menyenangkan, pasti akan kembali lagi!", "expected": "Positif"},
    {"text": "Film ini sangat bagus dan menghibur, recommended untuk ditonton bersama keluarga.", "expected": "Positif"},
    {"text": "Hotelnya bersih, nyaman, dan staff-nya sangat membantu. Sangat puas menginap di sini.", "expected": "Positif"},
    {"text": "Produk ini benar-benar berkualitas tinggi, harganya sepadan dengan manfaatnya.", "expected": "Positif"},
    {"text": "Terima kasih banyak atas pelayanan yang cepat dan profesional!", "expected": "Positif"},
    {"text": "Sangat senang dengan hasil kerjanya, melebihi ekspektasi saya.", "expected": "Positif"},
    {"text": "Tempat wisata ini indah sekali, pemandangannya menakjubkan!", "expected": "Positif"},
    
    # NEGATIF (10 cases)
    {"text": "Saya sangat kecewa dengan pelayanan toko ini, pengiriman lambat dan barang rusak.", "expected": "Negatif"},
    {"text": "Makanannya tidak enak, hambar dan harganya terlalu mahal.", "expected": "Negatif"},
    {"text": "Aplikasi ini sering crash dan sangat lambat, tolong diperbaiki segera.", "expected": "Negatif"},
    {"text": "Sangat mengecewakan, kualitas produk jauh dari yang diiklankan.", "expected": "Negatif"},
    {"text": "Pelayanan customer service sangat buruk, tidak responsif dan tidak membantu.", "expected": "Negatif"},
    {"text": "Hotel ini kotor dan fasilitasnya rusak, tidak worth it dengan harganya.", "expected": "Negatif"},
    {"text": "Pengalaman terburuk yang pernah saya alami, tidak akan pernah kembali lagi.", "expected": "Negatif"},
    {"text": "Barang yang dikirim berbeda dengan pesanan, sangat kecewa dengan toko ini.", "expected": "Negatif"},
    {"text": "Film ini membosankan dan menyia-nyiakan waktu saya.", "expected": "Negatif"},
    {"text": "Produk cacat dan tidak bisa digunakan sama sekali, minta refund.", "expected": "Negatif"},
    
    # NETRAL (10 cases)
    {"text": "Saya membeli buku ini di toko buku kemarin sore.", "expected": "Netral"},
    {"text": "Hari ini cuaca cukup cerah dengan sedikit awan.", "expected": "Netral"},
    {"text": "Pertemuan akan diadakan pada hari Senin pukul 10 pagi.", "expected": "Netral"},
    {"text": "Restoran ini buka dari jam 9 pagi sampai 10 malam.", "expected": "Netral"},
    {"text": "Harga tiket masuk museum adalah 25 ribu rupiah per orang.", "expected": "Netral"},
    {"text": "Produk ini tersedia dalam warna merah, biru, dan hijau.", "expected": "Netral"},
    {"text": "Aplikasi ini memiliki fitur chat, video call, dan sharing file.", "expected": "Netral"},
    {"text": "Toko ini terletak di lantai 2 gedung sebelah kanan.", "expected": "Netral"},
    {"text": "Saya akan menghadiri seminar hari Kamis besok.", "expected": "Netral"},
    {"text": "Buku ini ditulis oleh penulis terkenal dari Indonesia.", "expected": "Netral"},
]

def run_test():
    print("="*60)
    print("SENTIMENT CLASSIFICATION ACCURACY TEST")
    print("="*60)
    print(f"Total test cases: {len(test_cases)}")
    print("="*60)
    
    results = {"Positif": {"correct": 0, "total": 0},
               "Negatif": {"correct": 0, "total": 0}, 
               "Netral": {"correct": 0, "total": 0}}
    
    passed = 0
    confidences = []
    
    for i, case in enumerate(test_cases, 1):
        try:
            resp = requests.post(API_URL, json={"text_input": case["text"]}, timeout=10)
            data = resp.json()
            actual = data["sentiment"]
            conf = data["confidence"]
            expected = case["expected"]
            
            results[expected]["total"] += 1
            confidences.append(conf)
            
            if actual == expected:
                passed += 1
                results[expected]["correct"] += 1
                status = "OK"
            else:
                status = "FAIL"
                print(f"\n[{i}] {status}: Expected={expected}, Got={actual}, Conf={conf:.1%}")
                print(f"    Text: {case['text'][:60]}...")
        except Exception as e:
            print(f"[{i}] ERROR: {e}")
    
    # Summary
    print("\n" + "="*60)
    print("RESULTS SUMMARY")
    print("="*60)
    
    accuracy = (passed / len(test_cases)) * 100
    avg_conf = (sum(confidences) / len(confidences)) * 100
    
    print(f"Overall Accuracy: {passed}/{len(test_cases)} = {accuracy:.2f}%")
    print(f"Average Confidence: {avg_conf:.2f}%")
    print("-"*60)
    
    for sentiment in ["Positif", "Negatif", "Netral"]:
        total = results[sentiment]["total"]
        correct = results[sentiment]["correct"]
        if total > 0:
            acc = (correct / total) * 100
            print(f"{sentiment:8s}: {correct}/{total} = {acc:.1f}%")
    
    print("="*60)
    
    if accuracy >= 90:
        print("STATUS: PASSED - Accuracy >= 90%")
    else:
        print("WARNING: Accuracy < 90%")
    
    print("="*60)
    
    return accuracy

if __name__ == "__main__":
    run_test()
