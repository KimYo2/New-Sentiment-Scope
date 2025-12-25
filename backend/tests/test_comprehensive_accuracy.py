import requests
import json
import time

API_URL = "http://127.0.0.1:5000/api/classify"

# Dataset test yang lebih komprehensif dengan berbagai nuansa
comprehensive_test_cases = [
    # ===== POSITIF - Berbagai konteks =====
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
    
    # ===== NEGATIF - Berbagai ekspresi kekecewaan =====
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
    
    # ===== NETRAL - Pernyataan faktual tanpa opini =====
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
    
    # ===== CAMPURAN - Test cases challenging =====
    {"text": "Produk bagus tapi pengirimannya lama sekali, agak kecewa.", "expected": "Negatif"},  # Mixed but leaning negative
    {"text": "Harganya memang mahal tapi kualitasnya sangat memuaskan.", "expected": "Positif"},  # Mixed but leaning positive
    {"text": "Tempatnya biasa saja, tidak istimewa tapi juga tidak mengecewakan.", "expected": "Netral"},
    {"text": "Layanan oke, tapi bisa lebih ditingkatkan lagi.", "expected": "Positif"},  # Slightly positive
    {"text": "Cukup puas dengan hasilnya meskipun masih ada kekurangan.", "expected": "Positif"},  # Mostly positive
]

def run_comprehensive_test():
    print("=" * 80)
    print("COMPREHENSIVE ACCURACY TEST - Sentiment Classification Model")
    print("=" * 80)
    print(f"Total Test Cases: {len(comprehensive_test_cases)}\n")
    
    passed = 0
    failed = 0
    failed_cases = []
    total_confidence = 0.0
    
    sentiment_stats = {
        "Positif": {"correct": 0, "total": 0},
        "Negatif": {"correct": 0, "total": 0},
        "Netral": {"correct": 0, "total": 0}
    }
    
    for idx, case in enumerate(comprehensive_test_cases, 1):
        try:
            response = requests.post(API_URL, json={"text_input": case["text"]}, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                actual = data["sentiment"]
                confidence = data['confidence']
                total_confidence += confidence
                
                expected = case["expected"]
                sentiment_stats[expected]["total"] += 1
                
                status = "[PASS]" if actual == expected else "[FAIL]"
                
                if actual == expected:
                    passed += 1
                    sentiment_stats[expected]["correct"] += 1
                    status_color = "green"
                else:
                    failed += 1
                    failed_cases.append({
                        "text": case["text"],
                        "expected": expected,
                        "actual": actual,
                        "confidence": confidence
                    })
                    status_color = "red"
                
                print(f"[{idx:2d}] [{status}] Expected: {expected:8s} | Actual: {actual:8s} | Conf: {confidence:6.2%}")
                
                if actual != expected:
                    print(f"     Text: {case['text'][:70]}...")
                    print()
                    
            else:
                print(f"[{idx:2d}] [ERROR] HTTP {response.status_code}: {response.text}")
                failed += 1
                
        except Exception as e:
            print(f"[{idx:2d}] [ERROR] Connection failed: {e}")
            failed += 1
    
    # Calculate metrics
    accuracy = (passed / len(comprehensive_test_cases)) * 100
    avg_confidence = (total_confidence / len(comprehensive_test_cases)) * 100
    
    print("\n" + "=" * 80)
    print("SUMMARY RESULTS")
    print("=" * 80)
    print(f"Total Test Cases : {len(comprehensive_test_cases)}")
    print(f"Passed          : {passed}")
    print(f"Failed          : {failed}")
    print(f"Overall Accuracy : {accuracy:.2f}%")
    print(f"Avg Confidence  : {avg_confidence:.2f}%")
    print("=" * 80)
    
    # Per-sentiment accuracy
    print("\nPER-SENTIMENT CLASS ACCURACY:")
    print("-" * 80)
    for sentiment, stats in sentiment_stats.items():
        if stats["total"] > 0:
            class_acc = (stats["correct"] / stats["total"]) * 100
            print(f"{sentiment:8s}: {stats['correct']:2d}/{stats['total']:2d} = {class_acc:6.2f}%")
    print("-" * 80)
    
    # Show failed cases
    if failed_cases:
        print("\n" + "=" * 80)
        print("FAILED TEST CASES (for review):")
        print("=" * 80)
        for i, case in enumerate(failed_cases, 1):
            print(f"\n{i}. Expected: {case['expected']} | Got: {case['actual']} (Conf: {case['confidence']:.2%})")
            print(f"   Text: {case['text']}")
    
    print("\n" + "=" * 80)
    if accuracy >= 90:
        print(">>> SUCCESS! Model accuracy is above 90% <<<")
    else:
        print(">>> WARNING: Model accuracy is below 90%, needs improvement <<<")
    print("=" * 80)
    
    return accuracy, avg_confidence

if __name__ == "__main__":
    print("\n")
    accuracy, confidence = run_comprehensive_test()
    
    # Exit code based on accuracy
    exit(0 if accuracy >= 90 else 1)
