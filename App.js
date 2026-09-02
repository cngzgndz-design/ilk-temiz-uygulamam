import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Modal, Linking, Platform, Image } from 'react-native';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, setDoc, getDocs, getDoc } from 'firebase/firestore';

// Web ortamında mobil reklam modülünün çökmesini önleyen güvenli yükleme
let BannerAd = null;
let BannerAdSize = null;
let TestIds = null;

if (Platform.OS !== 'web') {
  try {
    const ads = require('react-native-google-mobile-ads');
    BannerAd = ads.BannerAd;
    BannerAdSize = ads.BannerAdSize;
    TestIds = ads.TestIds;
  } catch (e) {
    console.log("Reklam modülü yüklenemedi:", e);
  }
}

const adUnitId = (__DEV__ && TestIds) ? TestIds.BANNER : 'ca-app-pub-8577494064582289/4504789547';

const firebaseConfig = {
  apiKey: "AIzaSyDyGdTUpsPc8C60cgt3kNWs3kFCY_6x9J0",
  authDomain: "ordumumessilleri.firebaseapp.com",
  projectId: "ordumumessilleri",
  storageBucket: "ordumumessilleri.firebasestorage.app",
  messagingSenderId: "235964320544",
  appId: "1:235964320544:web:1e7c0c54fc33c27a85a545",
  measurementId: "G-9ZXQVQ2TZ4"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

function OrduMumessilleriLogosu() {
  return (
    <View style={logoStyles.logoMerkezKonteyner}>
      <Image 
        source={require('./assets/logo.png')} 
        style={{ width: 100, height: 100, resizeMode: 'contain', marginBottom: 10 }} 
      />
      <View style={logoStyles.logoMetinAlani}>
        <Text style={logoStyles.logoAnaYazi}>ORDU</Text>
        <Text style={logoStyles.logoAltYazi}>MÜMESSİLLERİ</Text>
      </View>
    </View>
  );
}

const SvgIkon = ({ veri, width = 24, height = 24 }) => {
  if (Platform.OS === 'web') {
    return (
      <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d={veri} fill="#00205B" />
      </svg>
    );
  }
  return <Text style={{ fontSize: 20, color: '#00205B' }}>🌐</Text>;
};

const IKON_YOLLARI = {
  facebook: "M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z",
  twitter: "M22 5.8c-.7.3-1.5.5-2.3.6.8-.5 1.4-1.3 1.7-2.2-.8.5-1.6.8-2.5 1-1.5-1.6-4-1.6-5.5 0-1 .9-1.4 2.3-1.1 3.6C9.3 8.6 6.3 7 4.3 4.5c-1.1 1.8-.6 4.1 1.1 5.3-.6 0-1.2-.2-1.7-.5v.1c0 1.9 1.3 3.5 3.2 3.9-.6.2-1.2.2-1.8.1.5 1.6 2 2.7 3.7 2.7-1.4 1.1-3.1 1.7-4.9 1.7-.3 0-.6 0-.9-.1 1.8 1.1 3.9 1.8 6.2 1.8 7.4 0 11.5-6.1 11.5-11.5v-.5c.8-.6 1.5-1.3 2-2.1z",
  instagram: "M12 2.1c3.2 0 3.6 0 4.9.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.9s0 3.6-.1 4.9c-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.9.1s-3.6 0-4.9-.1c-3.2-.1-4.8-1.7-4.9-4.9-.1-1.3-.1-1.6-.1-4.9s0-3.6.1-4.9c.1-3.2 1.7-4.8 4.9-4.9 1.3-.1 1.6-.1 4.9-.1M12 0C8.7 0 8.3 0 7 1 .3 1.3 0 3.6 0 7c0 1.3 0 1.7.1 3s0 3.6.1 4.9c.3 3.4 2.2 5.3 5.6 5.6 1.3.1 1.7.1 3 .1s3.6 0 4.9-.1c3.4-.3 5.3-2.2 5.6-5.6.1-1.3.1-1.7.1-3s0-3.6-.1-4.9c-.3-3.4-2.2-5.3-5.6-5.6C15.7 0 15.3 0 12 0zm0 5.8c-3.4 0-6.2 2.8-6.2 6.2s2.8 6.2 6.2 6.2 6.2-2.8 6.2-6.2-2.8-6.2-6.2-6.2zm0 10.2c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4zm6.4-11.8c-.8 0-1.4.6-1.4 1.4s.6 1.4 1.4 1.4 1.4-.6 1.4-1.4-.6-1.4-1.4-1.4z",
  youtube: "M23.5 6.2c-.3-1.1-1.1-2-2.2-2.3C19.3 3.5 12 3.5 12 3.5s-7.3 0-9.3.4c-1.1.3-1.9 1.2-2.2 2.3C0 8.2 0 12 0 12s0 3.8.4 5.8c.3 1.1 1.1 2 2.2 2.3 2 .4 9.3.4 9.3.4s7.3 0 9.3-.4c1.1-.3 1.9-1.2 2.2-2.3.4-2 .4-5.8.4-5.8s0-3.8-.4-5.8zM9.5 15.5V8.5l6.5 3.5-6.5 3.5z",
  linkedin: "M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.26c-.96 0-1.74-.78-1.74-1.74s.78-1.74 1.74-1.74 1.74.78 1.74 1.74-.78 1.74-1.74 1.74zm12.5 12.26h-3v-5.59c0-1.33-.03-3.05-1.86-3.05-1.86 0-2.15 1.45-2.15 2.95v5.69h-3v-11h2.88v1.5h.04c.4-.76 1.38-1.56 2.84-1.56 3.04 0 3.6 2 3.6 4.61v6.45z",
  whatsapp: "M12.004 2C6.48 2 2 6.48 2 12.004c0 1.765.458 3.424 1.258 4.874L2 22l5.25-.132A9.957 9.957 0 0012.004 22c5.523 0 10-4.48 10-10-4.477-10-10-10zm3.626 14.18c-.198.56-.99 1.092-1.55 1.15-.38.04-1.35.215-3.08-.501-2.213-.914-3.64-3.175-3.75-3.323-.11-.148-.895-1.192-.895-2.274 0-1.082.565-1.614.767-1.828.2-.214.54-.316.76-.316h.5c.16 0 .37 0 .54.403.185.438.636 1.545.69 1.66.056.115.093.248.016.4-.076.15-.113.249-.23.383-.116.134-.247.3-.353.402-.12.115-.246.241-.106.484.14.243.625 1.031 1.34 1.667.92.819 1.696 1.072 1.936 1.192.24.12.38.103.522-.06.14-.165.602-.702.763-.94.161-.24.32-.198.54-.115.22.082 1.404.661 1.644.78.24.12.4.181.46.28.06.1.06.578-.138 1.138z",
  adres: "M12 2C7.6 2 4 5.6 4 10c0 5.2 7 12 8 12s8-6.8 8-12c0-4.4-3.6-10-10-10zm0 11c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3z"
};

export default function App() {
  const [mevcutEkran, setMevcutEkran] = useState('uye');
  const [isletmeler, setIsletmeler] = useState([]);
  const [kategoriler, setKategoriler] = useState([]);
  const [sosyalMedya, setSosyalMedya] = useState({ facebook: '', twitter: '', instagram: '', linkedin: '', whatsapp: '', adres: '' });
  const [yonetimKurulu, setYonetimKurulu] = useState([]);

  const fileInputRef = useRef(null);
  const yardimciFotoRefs = useRef([]);

  // Yönetici girişi varsayılan olarak kapalı (Şifre zorunlu)
  const [adminGirisYaptiMi, setAdminGirisYaptiMi] = useState(false);

  const [girilenSifre, setGirilenSifre] = useState('');
  
  const adminGirisKontrol = async () => {
    try {
      const sifreRef = doc(db, "ayarlar", "guvenlik");
      const docSnap = await getDoc(sifreRef);
      
      let veritabanindakiSifre = "nemesis123";
      if (docSnap.exists() && docSnap.data().adminSifre) {
        veritabanindakiSifre = docSnap.data().adminSifre;
      }

      if (girilenSifre === veritabanindakiSifre) {
        setAdminGirisYaptiMi(true);
        setGirilenSifre('');
      } else {
        alert("Hatalı şifre!");
      }
    } catch (e) {
      alert("Giriş sırasında bir hata oluştu: " + e.message);
    }
  };

  const [yeniSifreInput, setYeniSifreInput] = useState('');
  const [yuklenenDosyaAdi, setYuklenenDosyaAdi] = useState('');
  const [yuklenenDosyaData, setYuklenenDosyaData] = useState(null);

  const [uyeAramaMetni, setUyeAramaMetni] = useState('');
  const [uyeLimitInput, setUyeLimitInput] = useState('5');
  const [uyeMevcutSayfa, setUyeMevmetSayfa] = useState(1);

  const [adminAramaMetni, setAdminAramaMetni] = useState('');
  const [adminLimitInput, setAdminLimitInput] = useState('5');
  const [adminMevcutSayfa, setAdminMevcutSayfa] = useState(1);

  const [alarmLimitInput, setAlarmLimitInput] = useState('3');
  const [alarmMevcutSayfa, setAlarmMevcutSayfa] = useState(1);
  const [alarmKutusuAcikMi, setAlarmKutusuAcikMi] = useState(true);

  const [seciliKategoriFiltre, setSeciliKategoriFiltre] = useState('Hepsi');
  const [duzenlenenId, setDuzenlenenId] = useState(null);
  const [dropdownAcikMi, setDropdownAcikMi] = useState(false);
  const [formAcikMi, setFormAcikMi] = useState(false);

  const [formKurumAdi, setFormKurumAdi] = useState('');
  const [formSeciliKategori, setFormSeciliKategori] = useState('');
  const [formAvantajDetayi, setFormAvantajDetayi] = useState('');
  const [formBaslangic, setFormBaslangic] = useState('');
  const [formBitis, setFormBitis] = useState('');
  const [formKonum, setFormKonum] = useState('');

  const [elleKategoriGirisAcikMi, setElleKategoriGirisAcikMi] = useState(false);
  const [elleYazilanKategori, setElleYazilanKategori] = useState('');

  const [uyeDropdownAcikMi, setUyeDropdownAcikMi] = useState(false);
  const [yanMenuAcikMi, setYanMenuAcikMi] = useState(false);
  const [sosyalModalAcikMi, setSosyalModalAcikMi] = useState(false);
  const [sifreModalAcikMi, setSifreModalAcikMi] = useState(false);
  const [yonetimModalAcikMi, setYonetimModalAcikMi] = useState(false);
  const [mesajModalAcikMi, setMesajModalAcikMi] = useState(false);
  
  const [uyeYonetimAcikMi, setUyeYonetimAcikMi] = useState(false);
  const [uyeMesajAcikMi, setUyeMesajAcikMi] = useState(false);

  const [inputFb, setInputFb] = useState('');
  const [inputX, setInputX] = useState('');
  const [inputInsta, setInputInsta] = useState('');
  const [inputYt, setInputYt] = useState('');
  const [inputWa, setInputWa] = useState('');
  const [inputAdres, setInputAdres] = useState('');

  const [formYonetimListesi, setFormYonetimListesi] = useState([{ ad: '', gorev: '', sira: '1', foto: '' }]);
  const [baskaninMesajı, setBaskaninMesajı] = useState('');
  const [inputMesaj, setInputMesaj] = useState('');

  const veritabaniniYedekle = async () => {
    try {
      const koleksiyonlar = ['isletmeler', 'kategoriler', 'ayarlar', 'kurul', 'mesaj'];
      let yedekPaketi = {};
      for (const kol of koleksiyonlar) {
        const querySnapshot = await getDocs(collection(db, kol));
        yedekPaketi[kol] = [];
        querySnapshot.forEach((doc) => {
          yedekPaketi[kol].push({ id: doc.id, ...doc.data() });
        });
      }
      const jsonVeri = JSON.stringify(yedekPaketi);
      const blob = new Blob([jsonVeri], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `yedek_${new Date().toLocaleDateString()}.json`;
      link.click();
      alert("Yedekleme dosyası bilgisayarınıza indirildi!");
    } catch (e) {
      alert("Yedekleme hatası: " + e.message);
    }
  };

  const veritabaniniGeriYukle = async (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const veri = JSON.parse(e.target.result);
        for (const [koleksiyon, dokumanlar] of Object.entries(veri)) {
          for (const docData of dokumanlar) {
            const { id, ...data } = docData;
            await setDoc(doc(db, koleksiyon, id), data);
          }
        }
        alert("Veritabanı başarıyla geri yüklendi!");
      } catch (err) {
        alert("Geri yükleme hatası: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  function fotografSikistirVeDonustur(dosya, callback) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      const img = new window.Image();
      img.src = dataUrl;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const MAX_SIZE = 400;
        if (width > MAX_SIZE || height > MAX_SIZE) {
          if (width > height) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          } else {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.6);
        callback(compressedDataUrl);
      };
    };
    reader.readAsDataURL(dosya);
  }

  function dosyayiSistemeYukle(event) {
    const dosya = event.target.files[0];
    if (!dosya) return;
    setYuklenenDosyaAdi(dosya.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      if (dosya.type.startsWith('image/')) {
        const img = new window.Image();
        img.src = dataUrl;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_SIZE = 1200;
          if (width > MAX_SIZE || height > MAX_SIZE) {
            if (width > height) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            } else {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setYuklenenDosyaData(compressedDataUrl);
        };
      } else {
        setYuklenenDosyaData(dataUrl);
      }
    };
    reader.readAsDataURL(dosya);
  }

  function dinamikKadroFotoYukle(event, indeks) {
    const dosya = event.target.files[0];
    if (!dosya) return;
    fotografSikistirVeDonustur(dosya, (dataUrl) => {
      const guncel = [...formYonetimListesi];
      guncel[indeks].foto = dataUrl;
      setFormYonetimListesi(guncel);
    });
  }

  function dinamikKadroSatirEkle() {
    const sonrakiSira = String(formYonetimListesi.length + 1);
    setFormYonetimListesi([...formYonetimListesi, { ad: '', gorev: '', sira: sonrakiSira, foto: '' }]);
  }

  function dinamikKadroSatirSil(indeks) {
    const guncel = formYonetimListesi.filter((_, i) => i !== indeks);
    setFormYonetimListesi(guncel.length > 0 ? guncel : [{ ad: '', gorev: '', sira: '1', foto: '' }]);
  }

  function dinamikKadroHücreDegis(deger, indeks, alan) {
    const guncel = [...formYonetimListesi];
    guncel[indeks][alan] = deger;
    setFormYonetimListesi(guncel);
  }

  function varsayilanTarihleriAyarla() {
    const bugun = new Date();
    const gun = String(bugun.getDate()).padStart(2, '0');
    const ay = String(bugun.getMonth() + 1).padStart(2, '0');
    const yil = bugun.getFullYear();
    setFormBaslangic(`${gun}.${ay}.${yil}`);
    setFormBitis(`${gun}.${ay}.${yil + 1}`);
  }

  function formuTemizle() {
    setFormKurumAdi(''); 
    setFormSeciliKategori(''); 
    setFormAvantajDetayi(''); 
    setFormKonum('');
    setYuklenenDosyaAdi(''); 
    setYuklenenDosyaData(null); 
    setDuzenlenenId(null);
    setElleKategoriGirisAcikMi(false); 
    setElleYazilanKategori('');
    varsayilanTarihleriAyarla();
  }

  function adminCikisYap() {
    setAdminGirisYaptiMi(false);
    setYanMenuAcikMi(false);
    formuTemizle();
  }

  function formDuzenlemeyiIptalEtVeKapat() {
    formuTemizle();
    setFormAcikMi(false);
  }

  function yuklenenDosyayiKaldır() {
    setYuklenenDosyaAdi('');
    setYuklenenDosyaData(null);
  }

  function dosyaGoruntule(dosyaData, dosyaAdi) {
    if (!dosyaData) return;
    const yeniSekme = window.open();
    if (yeniSekme) {
      if (dosyaData.startsWith('data:image/')) {
        yeniSekme.document.write(`
          <html>
            <head><title>${dosyaAdi || "Anlaşma Belgesi"}</title></head>
            <body style="margin:0;background:#000;display:flex;justify-content:center;align-items:center;height:100vh;">
              <img src="${dosyaData}" style="max-width:100%;max-height:100%;object-fit:contain;" />
            </body>
          </html>
        `);
      } else {
        yeniSekme.document.write(`<iframe src="${dosyaData}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
      }
      yeniSekme.document.title = dosyaAdi || "Anlaşma Belgesi";
    }
  }

  function dosyaIndir(dosyaData, dosyaAdi) {
    if (!dosyaData) return;
    const link = document.createElement('a');
    link.href = dosyaData;
    link.download = dosyaAdi || 'anlasma_belgesi';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function LoginiKapat() {
    setGirilenSifre('');
  }

  function haritadaKonumAc(kurumAdi, konumBilgisi) {
    if (!kurumAdi || !konumBilgisi) return;
    const urlFormatliSorgu = encodeURIComponent(`${kurumAdi} ${konumBilgisi}`);
    const url = Platform.select({
      ios: `maps://app?q=${urlFormatliSorgu}`,
      android: `geo:0,0?q=${urlFormatliSorgu}`,
      default: `https://www.google.com/maps/search/?api=1&query=${urlFormatliSorgu}`
    });
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        const webUrl = `https://www.google.com/maps/search/?api=1&query=${urlFormatliSorgu}`;
        Linking.openURL(webUrl).catch(() => alert("Harita servisi başlatılamadı."));
      }
    }).catch(() => {
      const fallbackUrl = `https://www.google.com/maps/search/?api=1&query=${urlFormatliSorgu}`;
      Linking.openURL(fallbackUrl);
    });
  }

  async function sifreyiGuncelle() {
    const temizSifre = yeniSifreInput.trim();
    if (!temizSifre) { alert("Şifre boş bırakılamaz."); return; }
    
    try {
      await setDoc(doc(db, "ayarlar", "guvenlik"), {
        adminSifre: temizSifre
      }, { merge: true });
      
      setYeniSifreInput('');
      setSifreModalAcikMi(false);
      alert("Yönetici giriş şifresi bulut üzerinde başarıyla güncellendi!");
    } catch (error) {
      alert("Şifre güncellenirken hata oluştu: " + error.message);
    }
  }

  const sosyalMedyaAyarlariniKaydet = async () => {
    try {
      await setDoc(doc(db, "ayarlar", "sosyalmedya"), {
        facebook: inputFb.trim(),
        twitter: inputX.trim(),
        instagram: inputInsta.trim(),
        linkedin: inputYt.trim(),
        whatsapp: inputWa.trim(),
        adres: inputAdres.trim()
      });
      alert("Tüm kurumsal iletişim bağlantıları bulutta başarıyla güncellendi!");
      setSosyalModalAcikMi(false);
    } catch (error) {
      alert("Hata: " + error.message);
    }
  };

  const yonetimKurulunuKaydet = async () => {
    try {
      const temizKadrolar = formYonetimListesi
        .filter(k => k.ad.trim() !== '' && k.gorev.trim() !== '')
        .map(k => ({
          ad: k.ad.trim(),
          gorev: k.gorev.trim(),
          sira: parseInt(k.sira, 10) || 99,
          foto: k.foto
        }));

      await setDoc(doc(db, "ayarlar", "yonetimkurulu_yeni"), {
        kadro: temizKadrolar
      });
      alert("Dinamik Yönetim Kurulu kadrosu bulut üzerinde başarıyla güncellendi!");
      setYonetimModalAcikMi(false);
    } catch (error) {
      alert("Bulut kayıt hatası: " + error.message);
    }
  };

  const baskanMesajiniKaydet = async () => {
    try {
      await setDoc(doc(db, "ayarlar", "baskanmesaji"), {
        mesaj: inputMesaj.trim()
      });
      alert("Başkanın Mesajı başarıyla güncellendi!");
      setMesajModalAcikMi(false);
    } catch (error) {
      alert("Hata: " + error.message);
    }
  };

  const kurumuVeritabanindanSil = async (id, ad) => {
    const onay = window.confirm(`"${ad}" kurumunu buluttan silmek istediğinize emin misiniz?`);
    if (onay) {
      try {
        await deleteDoc(doc(db, "isletmeler", id));
        alert("Kurum silindi.");
        if (duzenlenenId === id) { formuTemizle(); setFormAcikMi(false); }
      } catch (error) {
        alert("Hata: " + error.message);
      }
    }
  };

  const sozlesmeyiKaydet = async () => {
    if(!formKurumAdi || !formAvantajDetayi || !formKonum || !formSeciliKategori) {
      alert("Lütfen tüm zorunlu alanları doldurun.");
      return;
    }

    const veriPaketi = {
      ad: formKurumAdi,
      kategori: formSeciliKategori,
      indirim: formAvantajDetayi, 
      konum: formKonum,
      baslangic: formBaslangic,
      bitis: formBitis,
      dosyaUrl: yuklenenDosyaData || null,
      dosyaAdi: yuklenenDosyaAdi || "",
      eklenmeTarihi: new Date().getTime()
    };

    try {
      if (duzenlenenId) {
        await updateDoc(doc(db, "isletmeler", duzenlenenId), veriPaketi);
        alert("Sözleşme uzatıldı / güncellendi!");
        setDuzenlenenId(null);
      } else {
        await addDoc(collection(db, "isletmeler"), veriPaketi);
        alert(`"${formKurumAdi}" başarıyla işlendi!`);
      }
      formuTemizle();
      setFormAcikMi(false);
    } catch (error) {
      alert("Hata: " + error.message);
    }
  };

  const duzenleModunuAc = (kurum) => {
    setFormAcikMi(true);
    setDuzenlenenId(kurum.id);
    setFormKurumAdi(kurum.ad);
    setFormSeciliKategori(kurum.kategori);
    setFormAvantajDetayi(kurum.indirim || '');
    setFormBaslangic(kurum.baslangic);
    setFormBitis(kurum.bitis);
    setFormKonum(kurum.konum);
    setYuklenenDosyaAdi(kurum.dosyaAdi || '');
    setYuklenenDosyaData(kurum.dosyaUrl || null);
    if (Platform.OS === 'web') { window.scrollTo({ top: 0, behavior: 'smooth' }); }
  };

  const elleKategoriEkleYönetimi = async () => {
    const temizKategori = elleYazilanKategori.trim();
    if (!temizKategori) { alert("Lütfen geçerli bir kategori adı yazın."); return; }
    const varMi = kategoriler.some(k => k.name.toLowerCase() === temizKategori.toLowerCase());
    if (varMi) { alert("Bu kategori zaten mevcut."); return; }
    try {
      await addDoc(collection(db, "kategoriler"), { name: temizKategori });
      setFormSeciliKategori(temizKategori);
      setElleYazilanKategori('');
      setElleKategoriGirisAcikMi(false);
      alert(`"${temizKategori}" kategorisi eklendi!`);
    } catch (error) {
      alert("Hata: " + error.message);
    }
  };

  const kategoriDuzenle = async (katNesnesi) => {
    const yeniAd = window.prompt(`"${katNesnesi.name}" kategorisinin yeni adı ne olsun?`, katNesnesi.name);
    if (yeniAd && yeniAd.trim() !== "" && yeniAd.trim() !== katNesnesi.name) {
      const temizYeniAd = yeniAd.trim();
      try {
        await updateDoc(doc(db, "kategoriler", katNesnesi.id), { name: temizYeniAd });
        if (formSeciliKategori === katNesnesi.name) setFormSeciliKategori(temizYeniAd);
        if (seciliKategoriFiltre === katNesnesi.name) setSeciliKategoriFiltre(temizYeniAd);
        alert("Kategori güncellendi.");
      } catch (error) {
        alert("Hata: " + error.message);
      }
    }
  };

  const kategoriSil = async (katNesnesi) => {
    const onay = window.confirm(`"${katNesnesi.name}" kategorisini silmek istiyor musunuz?`);
    if (onay) {
      try {
        await deleteDoc(doc(db, "kategoriler", katNesnesi.id));
        if (formSeciliKategori === katNesnesi.name) setFormSeciliKategori('');
        if (seciliKategoriFiltre === katNesnesi.name) setSeciliKategoriFiltre('Hepsi');
        alert("Kategori silindi.");
      } catch (error) {
        alert("Hata: " + error.message);
      }
    }
  };

  const sosyalLinkAc = (platform, deger) => {
    if (!deger) return;
    let url = deger;
    if (platform === 'whatsapp') {
      if (deger.includes('chat.whatsapp.com') || deger.includes('wa.me')) {
        url = deger; 
      } else {
        const temizNumara = deger.replace(/[^0-9]/g, '');
        url = `https://wa.me/${temizNumara.startsWith('90') ? temizNumara : '90' + temizNumara}`;
      }
    } else if (platform === 'adres') {
      url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(deger)}`;
    } else if (!deger.startsWith('http://') && !deger.startsWith('https://')) {
      url = `https://${deger}`;
    }
    Linking.openURL(url).catch(() => alert("Bağlantı açılamadı."));
  };

  useEffect(() => {
    const q = query(collection(db, "isletmeler"), orderBy("eklenmeTarihi", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const veriler = [];
      snapshot.forEach((doc) => { veriler.push({ id: doc.id, ...doc.data() }); });
      setIsletmeler(veriler);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "kategoriler"), orderBy("name", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const veriler = [];
      snapshot.forEach((doc) => { veriler.push({ id: doc.id, ...doc.data() }); });
      setKategoriler(veriler);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "ayarlar", "sosyalmedya"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSosyalMedya(data);
        setInputFb(data.facebook || '');
        setInputX(data.twitter || '');
        setInputInsta(data.instagram || '');
        setInputYt(data.linkedin || '');
        setInputWa(data.whatsapp || '');
        setInputAdres(data.adres || '');
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "ayarlar", "yonetimkurulu_yeni"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.kadro) {
          const siraliKadro = [...data.kadro].sort((a, b) => a.sira - b.sira);
          setYonetimKurulu(siraliKadro);
          
          const formVerisi = siraliKadro.map(k => ({
            ad: k.ad,
            gorev: k.gorev,
            sira: String(k.sira),
            foto: k.foto || ''
          }));
          setFormYonetimListesi(formVerisi.length > 0 ? formVerisi : [{ ad: '', gorev: '', sira: '1', foto: '' }]);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "ayarlar", "baskanmesaji"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setBaskaninMesajı(data.mesaj || '');
        setInputMesaj(data.mesaj || '');
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => { setUyeMevmetSayfa(1); }, [uyeAramaMetni, uyeLimitInput, seciliKategoriFiltre]);
  useEffect(() => { setAdminMevcutSayfa(1); }, [adminAramaMetni, adminLimitInput]);
  useEffect(() => { setAlarmMevcutSayfa(1); }, [alarmLimitInput]);

  const alarmKurumlariniFiltrele = () => {
    const bugun = new Date();
    bugun.setHours(0, 0, 0, 0);
    return isletmeler.filter(isletme => {
      if (!isletme.bitis) return false;
      const eslesme = isletme.bitis.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
      if (!eslesme) return false;
      const bitisTarihi = new Date(parseInt(eslesme[3], 10), parseInt(eslesme[2], 10) - 1, parseInt(eslesme[1], 10));
      const gunFarki = Math.floor((bitisTarihi.getTime() - bugun.getTime()) / (1000 * 3600 * 24));
      return gunFarki <= 30;
    });
  };

  const alarmListesiTümVeri = alarmKurumlariniFiltrele();
  const alarmLimit = (!alarmLimitInput || parseInt(alarmLimitInput) <= 0) ? alarmListesiTümVeri.length : parseInt(alarmLimitInput);
  const alarmToplamSayfa = Math.ceil(alarmListesiTümVeri.length / alarmLimit) || 1;
  const sayfalanmisAlarmListesi = alarmListesiTümVeri.slice((alarmMevcutSayfa - 1) * alarmLimit, (alarmMevcutSayfa - 1) * alarmLimit + alarmLimit);

  const filtrelenmisUyeIsletmeler = isletmeler.filter(isletme => {
    const katUygun = seciliKategoriFiltre === 'Hepsi' || isletme.kategori === seciliKategoriFiltre;
    return katUygun && (isletme.ad.toLowerCase().includes(uyeAramaMetni.toLowerCase()) || isletme.konum.toLowerCase().includes(uyeAramaMetni.toLowerCase()));
  });
  const uyeLimit = (!uyeLimitInput || parseInt(uyeLimitInput) <= 0) ? filtrelenmisUyeIsletmeler.length : parseInt(uyeLimitInput);
  const uyeToplamSayfa = Math.ceil(filtrelenmisUyeIsletmeler.length / uyeLimit) || 1;
  const sayfalanmisUyeIsletmeler = filtrelenmisUyeIsletmeler.slice((uyeMevcutSayfa - 1) * uyeLimit, (uyeMevcutSayfa - 1) * uyeLimit + uyeLimit);

  const filtrelenmisAdminIsletmeler = isletmeler.filter(isletme => isletme.ad.toLowerCase().includes(adminAramaMetni.toLowerCase()));
  const siraliAdminIsletmeler = [...filtrelenmisAdminIsletmeler].sort((a, b) => (b.eklenmeTarihi || 0) - (a.eklenmeTarihi || 0));
  const adminLimit = (!adminLimitInput || parseInt(adminLimitInput) <= 0) ? siraliAdminIsletmeler.length : parseInt(adminLimitInput);
  const adminToplamSayfa = Math.ceil(siraliAdminIsletmeler.length / adminLimit) || 1;
  const sayfalanmisAdminIsletmeler = siraliAdminIsletmeler.slice((adminMevcutSayfa - 1) * adminLimit, (adminMevcutSayfa - 1) * adminLimit + adminLimit);

  const baskanlar = yonetimKurulu.filter(k => k.gorev.toLowerCase() === 'başkan' || k.gorev.toLowerCase() === 'baskan');
  const baskanYardimcilari = yonetimKurulu.filter(k => k.gorev.toLowerCase().includes('yardımcı') || k.gorev.toLowerCase().includes('yardimci'));
  const digerGorevliler = yonetimKurulu.filter(k => 
    !baskanlar.includes(k) && 
    !baskanYardimcilari.includes(k) && 
    !k.gorev.toLowerCase().includes('üye') && !k.gorev.toLowerCase().includes('uye')
  );
  const duzUyeler = yonetimKurulu.filter(k => k.gorev.toLowerCase().includes('üye') || k.gorev.toLowerCase().includes('uye'));

  return (
    <ScrollView style={styles.anaScrollKonteyner} contentContainerStyle={styles.anaScrollIcerik} showsVerticalScrollIndicator={true}>
      
      {Platform.OS === 'web' && (
        <View style={{ position: 'absolute', width: 0, height: 0, opacity: 0, overflow: 'hidden' }}>
          <input type="file" ref={fileInputRef} onChange={dosyayiSistemeYukle} id="globalA4Input" accept="image/*,application/pdf" />
          {formYonetimListesi.map((_, i) => (
            <input key={i} type="file" id={`dinamikKadroInput-${i}`} ref={el => yardimciFotoRefs.current[i] = el} onChange={(e) => dinamikKadroFotoYukle(e, i)} accept="image/*" />
          ))}
        </View>
      )}

      <View style={styles.anaLogoAlani}>
        <OrduMumessilleriLogosu />
      </View>
      
      <View style={styles.ustAksiyonBari}>
        <View style={styles.hamburgerMenuAlaniKapsul}>
          {mevcutEkran === 'admin' && adminGirisYaptiMi ? (
            <TouchableOpacity style={styles.hamburgerMenuButon} activeOpacity={0.5} onPress={() => setYanMenuAcikMi(true)}>
              <Text style={{ fontSize: 28, color: '#00205B', fontWeight: 'bold', lineHeight: 30 }}>☰</Text>
            </TouchableOpacity>
          ) : <View style={{ width: 40 }} />}
        </View>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.navBar}>
        <TouchableOpacity style={[styles.navButon, mevcutEkran === 'uye' && styles.aktifNav]} onPress={() => setMevcutEkran('uye')}>
          <Text style={[styles.navYazi, mevcutEkran === 'uye' && {color: '#fff'}]}>Üye Ekranı</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navButon, mevcutEkran === 'admin' && styles.aktifNav]} onPress={() => setMevcutEkran('admin')}>
          <Text style={[styles.navYazi, mevcutEkran === 'admin' && {color: '#fff'}]}>🛡️ Yönetim Paneli</Text>
        </TouchableOpacity>
      </View>

      {/* ÜYE SEKMESİ İÇERİĞİ */}
      {mevcutEkran === 'uye' && (
        <View style={{ width: '100%' }}>
          <TextInput style={styles.aramaBar} placeholder="İşletme veya bölge ara..." placeholderTextColor="#777" value={uyeAramaMetni} onChangeText={setUyeAramaMetni} />
          <Text style={styles.inputEtiket}>Kategori Filtresi:</Text>
          <TouchableOpacity style={[styles.dropdownKutusu, { marginBottom: 15, backgroundColor: '#FFFFFF' }]} onPress={() => setUyeDropdownAcikMi(true)}>
            <Text style={[styles.dropdownKutusuYazisi, { fontWeight: '600', color: seciliKategoriFiltre === 'Hepsi' ? '#475569' : '#007A87' }]}>
              🔍 {seciliKategoriFiltre === 'Hepsi' ? 'Tüm Kategoriler (Hepsi)' : `Kategori: ${seciliKategoriFiltre}`}
            </Text>
          </TouchableOpacity>

          <View style={styles.manuelLimitSatiri}>
            <Text style={{ fontSize: 12, fontWeight: '600', flex: 2, color: '#333' }}>Sayfa Başına Gösterim Satırı:</Text>
            <TextInput style={styles.manuelLimitInputKutusu} value={uyeLimitInput} onChangeText={setUyeLimitInput} keyboardType="numeric" />
          </View>

          <View style={{ width: '100%' }}>
            {sayfalanmisUyeIsletmeler.map(item => {
              return (
                <View key={item.id} style={styles.kart}>
                  <View style={styles.kartSol}>
                    <Text style={styles.kartIsim}>{item.ad}</Text>
                    <Text style={styles.kartKategori}>📍 {item.konum} - {item.kategori}</Text>
                    <Text style={styles.tarihEtiket}>Süre: {item.baslangic} - {item.bitis}</Text>
                    {item.dosyaUrl && (
                      <TouchableOpacity style={styles.evrakButon} onPress={() => dosyaGoruntule(item.dosyaUrl, item.dosyaAdi)}>
                        <Text style={styles.evrakButonYazi}>📄 Anlaşma Metnini Görüntüle</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <View style={styles.kartSagKonteyner}>
                    <View style={styles.kartSag}>
                      <Text style={styles.indirimOrani} numberOfLines={2}>{item.indirim || 'Anlaşmalı'}</Text>
                      <Text style={styles.indirimEtiket}>AVANTAJ</Text>
                    </View>
                    <TouchableOpacity style={styles.yolTarifiButon} onPress={() => haritadaKonumAc(item.ad, item.konum)}>
                      <Text style={styles.yolTarifiYazi}>📍 Yol Tarifi</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>

          {uyeLimit < filtrelenmisUyeIsletmeler.length && uyeToplamSayfa > 1 ? (
            <View style={styles.sayfalamaNavigasyonSatiri}>
              <TouchableOpacity style={styles.sayfaGezmeButon} disabled={uyeMevcutSayfa === 1} onPress={() => setUyeMevmetSayfa(uyeMevcutSayfa - 1)}>
                <Text style={[styles.sayfaGezmeYazi, uyeMevcutSayfa === 1 && {opacity: 0.4}]}>◀️ Geri</Text>
              </TouchableOpacity>
              <Text style={styles.sayfaNumaraYazisi}>{uyeMevcutSayfa} / {uyeToplamSayfa}</Text>
              <TouchableOpacity style={styles.sayfaGezmeButon} disabled={uyeMevcutSayfa === uyeToplamSayfa} onPress={() => setUyeMevmetSayfa(uyeMevcutSayfa + 1)}>
                <Text style={[styles.sayfaGezmeYazi, uyeMevcutSayfa === uyeToplamSayfa && {opacity: 0.4}]}>İleri ▶️</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {yonetimKurulu.length > 0 ? (
            <View style={styles.kurumsalYonetimKadroBloku}>
              <TouchableOpacity style={styles.akordeonBaslikAlani} activeOpacity={0.7} onPress={() => setUyeYonetimAcikMi(!uyeYonetimAcikMi)}>
                <Text style={styles.yonetimKadroBaslik}>👥 YÖNETİM KURULU</Text>
                <Text style={{ fontSize: 14, color: '#00205B', fontWeight: 'bold' }}>{uyeYonetimAcikMi ? '➖' : '➕'}</Text>
              </TouchableOpacity>
              
              {uyeYonetimAcikMi && (
                <View style={{ width: '100%', alignItems: 'center', marginTop: 15 }}>
                  
                  {baskanlar.length > 0 && (
                    <View style={styles.agacKatmanAlani}>
                      <Text style={styles.agacKatmanEtiketi}>👑 YÖNETİM KURULU BAŞKANI</Text>
                      <View style={styles.yardimcilarKonteynerMatris}>
                        {baskanlar.map((govevli, idx) => (
                          <View key={idx} style={[styles.yardimciMiniKart, { borderColor: '#00205B', borderWidth: 2 }]}>
                            <View style={[styles.baskanProfilCerceve, { borderColor: '#00205B' }]}>
                              {govevli.foto ? <Image source={{ uri: govevli.foto }} style={styles.kadroProfilResmi} /> : <Text style={{ fontSize: 22 }}>👤</Text>}
                            </View>
                            <Text style={styles.yardimciIsimMetni}>{govevli.ad}</Text>
                            <Text style={[styles.kadroUnvanMetni, { color: '#00205B' }]}>{govevli.gorev}</Text>
                          </View>
                        ))}
                      </View>
                      <View style={styles.agacBaglantiCizgisi} />
                    </View>
                  )}

                  {baskanYardimcilari.length > 0 && (
                    <View style={styles.agacKatmanAlani}>
                      <Text style={styles.agacKatmanEtiketi}>👥 BAŞKAN YARDIMCILARI</Text>
                      <View style={styles.yardimcilarKonteynerMatris}>
                        {baskanYardimcilari.map((govevli, idx) => (
                          <View key={idx} style={[styles.yardimciMiniKart, { borderColor: '#4B9B28' }]}>
                            <View style={[styles.baskanProfilCerceve, { borderColor: '#4B9B28' }]}>
                              {govevli.foto ? <Image source={{ uri: govevli.foto }} style={styles.kadroProfilResmi} /> : <Text style={{ fontSize: 22 }}>👤</Text>}
                            </View>
                            <Text style={styles.yardimciIsimMetni}>{govevli.ad}</Text>
                            <Text style={[styles.kadroUnvanMetni, { color: '#4B9B28' }]}>{govevli.gorev}</Text>
                          </View>
                        ))}
                      </View>
                      <View style={styles.agacBaglantiCizgisi} />
                    </View>
                  )}

                  {digerGorevliler.length > 0 && (
                    <View style={styles.agacKatmanAlani}>
                      <Text style={styles.agacKatmanEtiketi}>💼 KURUMSAL GÖREVLİLER VE SORUMLULAR</Text>
                      <View style={styles.yardimcilarKonteynerMatris}>
                        {digerGorevliler.map((govevli, idx) => (
                          <View key={idx} style={[styles.yardimciMiniKart, { borderColor: '#007A87' }]}>
                            <View style={[styles.baskanProfilCerceve, { borderColor: '#007A87' }]}>
                              {govevli.foto ? <Image source={{ uri: govevli.foto }} style={styles.kadroProfilResmi} /> : <Text style={{ fontSize: 22 }}>👤</Text>}
                            </View>
                            <Text style={styles.yardimciIsimMetni}>{govevli.ad}</Text>
                            <Text style={[styles.kadroUnvanMetni, { color: '#007A87' }]}>{govevli.gorev}</Text>
                          </View>
                        ))}
                      </View>
                      <View style={styles.agacBaglantiCizgisi} />
                    </View>
                  )}

                  {duzUyeler.length > 0 && (
                    <View style={styles.agacKatmanAlani}>
                      <Text style={styles.agacKatmanEtiketi}>🎖️ KURUL ÜYELERİ</Text>
                      <View style={styles.yardimcilarKonteynerMatris}>
                        {duzUyeler.map((govevli, idx) => (
                          <View key={idx} style={[styles.yardimciMiniKart, { borderColor: '#cbd5e1', backgroundColor: '#fdfdfd' }]}>
                            <View style={[styles.baskanProfilCerceve, { borderColor: '#cbd5e1', width: 50, height: 50 }]}>
                              {govevli.foto ? <Image source={{ uri: govevli.foto }} style={styles.kadroProfilResmi} /> : <Text style={{ fontSize: 18 }}>👤</Text>}
                            </View>
                            <Text style={[styles.yardimciIsimMetni, { fontSize: 12 }]}>{govevli.ad}</Text>
                            <Text style={[styles.kadroUnvanMetni, { color: '#64748b', fontSize: 10 }]}>{govevli.gorev}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                </View>
              )}
            </View>
          ) : null}

          {baskaninMesajı ? (
            <View style={[styles.kurumsalYonetimKadroBloku, { marginTop: 15 }]}>
              <TouchableOpacity style={styles.akordeonBaslikAlani} activeOpacity={0.7} onPress={() => setUyeMesajAcikMi(!uyeMesajAcikMi)}>
                <Text style={styles.yonetimKadroBaslik}>BAŞKANIN MESAJI</Text>
                <Text style={{ fontSize: 14, color: '#00205B', fontWeight: 'bold' }}>{uyeMesajAcikMi ? '➖' : '➕'}</Text>
              </TouchableOpacity>
              {uyeMesajAcikMi && (
                <View style={styles.baskanMesajIcerikKonteyner}>
                  <Text style={styles.baskanMesajTekstHizalama}>{baskaninMesajı}</Text>
                </View>
              )}
            </View>
          ) : null}

          <View style={styles.kurumsalFooterSeridi}>
            <View style={styles.footerIkonSatiri}>
              {['facebook', 'twitter', 'instagram', 'linkedin', 'whatsapp', 'adres'].map((p) => sosyalMedya[p] ? (
                <TouchableOpacity key={p} style={styles.orjinalFooterKapsul} activeOpacity={0.6} onPress={() => sosyalLinkAc(p, sosyalMedya[p])}>
                  <SvgIkon veri={IKON_YOLLARI[p]} />
                  <Text style={styles.orjinalFooterMetin}>{p}</Text>
                </TouchableOpacity>
              ) : null)}
            </View>
          </View>

          {/* Banner Reklam Alanı (Web'de gizli, Mobilde aktif) */}
          {Platform.OS !== 'web' && BannerAd && (
            <View style={{ alignItems: 'center', marginVertical: 15 }}>
              <BannerAd
                unitId={adUnitId}
                size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
                requestOptions={{
                  requestNonPersonalizedAdsOnly: true,
                }}
              />
            </View>
          )}

          <Text style={styles.copyrightMetni}>© CG</Text>
        </View>
      )}

      {/* YÖNETİM PANELİ SEKMESİ İÇERİĞİ */}
      {mevcutEkran === 'admin' && (
        <View style={{ width: '100%' }}>
          {!adminGirisYaptiMi ? (
            <View style={styles.loginKonteyner}>
              <Text style={styles.loginBaslik}>🛡️ Yönetici Girişi</Text>
              <TextInput style={styles.inputField} placeholder="Yönetici Şifresi" placeholderTextColor="#999" secureTextEntry={true} value={girilenSifre} onChangeText={setGirilenSifre} />
              <View style={styles.satir}>
                <TouchableOpacity style={[styles.kaydetButon, {flex: 2, backgroundColor: '#00205B'}]} onPress={adminGirisKontrol}>
                  <Text style={styles.kaydetButonYazi}>Sisteme Giriş Yap</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.dropdownKapatButon, { flex: 1, marginTop: 10, marginLeft: 6, backgroundColor: '#6c757d' }]} onPress={LoginiKapat}>
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Temizle</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={{ width: '100%' }}>
              
              <View style={styles.adminBlok}>
                <Text style={styles.blokBaslik}>💾 Veri Yedekleme ve Güvenlik</Text>
                <View style={styles.satir}>
                  <TouchableOpacity style={[styles.kaydetButon, { flex: 1, backgroundColor: '#4B9B28', marginTop: 0 }]} onPress={veritabaniniYedekle}>
                    <Text style={styles.kaydetButonYazi}>📥 Veritabanını İndir (Yedekle)</Text>
                  </TouchableOpacity>
                </View>
                <Text style={[styles.inputEtiket, {marginTop:10}]}>Acil Durum Geri Yükleme:</Text>
                {Platform.OS === 'web' && (
                  <input type="file" onChange={(e) => veritabaniniGeriYukle(e.target.files[0])} />
                )}
              </View>

              <View style={[styles.adminBlok, { marginTop: 15 }]}>
                <TouchableOpacity style={styles.akordeonBaslikAlani} onPress={() => {
                    if (!formAcikMi) {
                        const d = new Date();
                        const y = new Date(); y.setFullYear(d.getFullYear() + 1);
                        setFormBaslangic(`${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}`);
                        setFormBitis(`${String(y.getDate()).padStart(2,'0')}.${String(y.getMonth()+1).padStart(2,'0')}.${y.getFullYear()}`);
                    }
                    setFormAcikMi(!formAcikMi);
                }}>
                   <Text style={styles.blokBaslikDokunmatik}>{duzenlenenId ? '✏️ Sözleşme Uzatma / Güncelleme' : '➕ Yeni Evrak ve Sözleşme Yükle'}</Text>
                   <Text style={styles.akordeonIcon}>{formAcikMi ? '➖' : '➕'}</Text>
                </TouchableOpacity>

                {formAcikMi && (
                  <View style={{ marginTop: 15 }}>
                    <Text style={styles.inputEtiket}>A4 Anlaşma Evrakı / Sözleşme Belgesi</Text>
                    
                    <View style={styles.dosyaYuklemeKapsayiciSatir}>
                      <TouchableOpacity style={[styles.dosyaYukleKutusu, { flex: 1, marginBottom: 0 }]} onPress={() => { if(Platform.OS === 'web') { document.getElementById('globalA4Input').click(); } }}>
                        <Text style={styles.dosyaYukleYazisi} numberOfLines={1}>{yuklenenDosyaAdi ? `📎 ${yuklenenDosyaAdi} (Değiştir)` : '📂 A4 Dosyası Seçin ve Sisteme Yükleyin'}</Text>
                      </TouchableOpacity>
                      {yuklenenDosyaData && (
                        <TouchableOpacity style={styles.dosyaKaldırKırmızıButon} onPress={yuklenenDosyayiKaldır}><Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>❌ Sil</Text></TouchableOpacity>
                      )}
                    </View>

                    {yuklenenDosyaData && (
                      <View style={styles.onizlemePanelSube}>
                        <Text style={styles.onizlemeBilgiYazi}>Yüklenen Belge Aksiyonu:</Text>
                        <View style={styles.satir}>
                          <TouchableOpacity style={styles.onizlemeAksiyonButon} onPress={() => dosyaGoruntule(yuklenenDosyaData, yuklenenDosyaAdi)}><Text style={styles.onizlemeButonMetni}>👁️ Görüntüle</Text></TouchableOpacity>
                          <TouchableOpacity style={[styles.onizlemeAksiyonButon, {backgroundColor: '#4B9B28', borderColor: '#4B9B28'}]} onPress={() => dosyaIndir(yuklenenDosyaData, yuklenenDosyaAdi)}><Text style={styles.onizlemeButonMetni}>⬇️ İndir</Text></TouchableOpacity>
                        </View>
                      </View>
                    )}

                    <Text style={styles.inputEtiket}>Kurum Adı</Text>
                    <TextInput style={styles.inputField} value={formKurumAdi} onChangeText={setFormKurumAdi} placeholder="Kurum Adı" placeholderTextColor="#999" />
                    
                    <Text style={styles.inputEtiket}>Kurum Kategorisi</Text>
                    <View style={[styles.satir, { marginBottom: 10 }]}>
                      <TouchableOpacity style={[styles.dropdownKutusu, { flex: 1, marginBottom: 0 }]} onPress={() => setDropdownAcikMi(true)}><Text style={styles.dropdownKutusuYazisi}>{formSeciliKategori ? `📂 ${formSeciliKategori}` : 'Kategori Seçin...'}</Text></TouchableOpacity>
                      <TouchableOpacity style={[styles.dropdownKutusu, { width: 45, marginLeft: 8, marginBottom: 0, backgroundColor: '#4B9B28', alignItems: 'center', justifyContent: 'center', borderWidth: 0 }]} onPress={() => setElleKategoriGirisAcikMi(!elleKategoriGirisAcikMi)}><Text style={{ color: '#fff', fontSize: 22, fontWeight: '900', lineHeight: 24 }}>{elleKategoriGirisAcikMi ? '➖' : '＋'}</Text></TouchableOpacity>
                    </View>

                    {elleKategoriGirisAcikMi && (
                      <View style={styles.elleKategoriBlok}>
                        <TextInput style={[styles.inputField, { flex: 1, marginBottom: 0, backgroundColor: '#fff' }]} value={elleYazilanKategori} onChangeText={setElleYazilanKategori} placeholder="Yeni kategori adı..." placeholderTextColor="#999" />
                        <TouchableOpacity style={styles.elleKategoriEkleButon} onPress={elleKategoriEkleYönetimi}><Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>Ekle</Text></TouchableOpacity>
                      </View>
                    )}

                    <Text style={styles.inputEtiket}>Kurumsal Avantaj / Anlaşma Detayı</Text>
                    <TextInput style={styles.inputField} value={formAvantajDetayi} onChangeText={setFormAvantajDetayi} placeholder="Örn: Restoran %20, Konaklama %10 İndirim veya 6 Taksit" placeholderTextColor="#999" />

                    <View style={styles.satir}>
                      <View style={{ flex: 1, marginRight: 5 }}><Text style={styles.inputEtiket}>Sözleşme Başlangıç (GG.AA.YYYY)</Text><TextInput style={styles.inputField} value={formBaslangic} onChangeText={setFormBaslangic} /></View>
                      <View style={{ flex: 1 }}><Text style={styles.inputEtiket}>Sözleşme Bitiş (GG.AA.YYYY)</Text><TextInput style={styles.inputField} value={formBitis} onChangeText={setFormBitis} /></View>
                    </View>

                    <Text style={styles.inputEtiket}>Bölge (İlçe/İl)</Text>
                    <TextInput style={styles.inputField} value={formKonum} onChangeText={setFormKonum} placeholder="Örn: Fatsa/Ordu" placeholderTextColor="#999" />

                    <View style={styles.satir}>
                      <TouchableOpacity style={[styles.kaydetButon, { flex: 2, backgroundColor: '#00205B' }]} onPress={sozlesmeyiKaydet}><Text style={styles.kaydetButonYazi}>💾 {duzenlenenId ? '🔄 Sözleşme Uzatmayı Kaydet' : ' Sözleşmeyi Buluta İşle'}</Text></TouchableOpacity>
                      <TouchableOpacity style={[styles.cikisButon, { flex: 1, marginLeft: 5, justifyContent:'center', backgroundColor: '#6c757d', marginTop: 10 }]} onPress={formDuzenlemeyiIptalEtVeKapat}><Text style={styles.cikisButonYazi}>İptal / Kapat</Text></TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>

              {alarmListesiTümVeri.length > 0 && (
                <View style={[styles.adminBlok, { marginTop: 15, borderColor: '#D32F2F', borderWidth: 1.5 }]}>
                  <TouchableOpacity style={styles.akordeonBaslikAlani} onPress={() => setAlarmKutusuAcikMi(!alarmKutusuAcikMi)}>
                    <Text style={[styles.blokBaslikDokunmatik, { color: '#D32F2F', fontWeight: 'bold' }]}>⚠️ Sözleşmesi Biten veya Son 1 Ay Kalan Kurumlar ({alarmListesiTümVeri.length})</Text>
                    <Text style={{ fontSize: 14, color: '#D32F2F', fontWeight: 'bold' }}>{alarmKutusuAcikMi ? '➖' : '➕'}</Text>
                  </TouchableOpacity>

                  {alarmKutusuAcikMi && (
                    <View style={{ marginTop: 10 }}>
                      <View style={[styles.manuelLimitSatiri, { backgroundColor: '#FFEBEE', borderColor: '#FFCDD2' }]}>
                        <Text style={{ fontSize: 11, fontWeight: '600', flex: 2, color: '#c62828' }}>Alarm Sayfa Başı Satır:</Text>
                        <TextInput style={[styles.manuelLimitInputKutusu, { color: '#D32F2F' }]} value={alarmLimitInput} onChangeText={setAlarmLimitInput} keyboardType="numeric" />
                      </View>

                      {sayfalanmisAlarmListesi.map(item => (
                        <View key={item.id} style={[styles.adminSatirKart, { backgroundColor: '#FFF5F5', borderRadius: 6, marginVertical: 4, padding: 8 }]}>
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontWeight: 'bold', color: '#c62828' }}>{item.ad}</Text>
                            <Text style={{ fontSize: 11, color: '#555' }}>Bitiş Tarihi: <Text style={{ fontWeight: 'bold', color: '#D32F2F' }}>{item.bitis}</Text></Text>
                          </View>
                          <View style={styles.adminAksiyonGrup}>
                            <TouchableOpacity style={[styles.duzenleIkonButon, { backgroundColor: '#FFEBEE' }]} onPress={() => duzenleModunuAc(item)}><Text style={{ fontSize: 12, color: '#D32F2F', fontWeight: 'bold' }}>✏️ Sözleşme Uzat</Text></TouchableOpacity>
                            <TouchableOpacity style={styles.silIkonButon} onPress={() => kurumuVeritabanindanSil(item.id, item.ad)}><Text style={{ fontSize: 12, color: '#fff', fontWeight: 'bold' }}>🗑️ Sil</Text></TouchableOpacity>
                          </View>
                        </View>
                      ))}
                      
                      {alarmLimit < alarmListesiTümVeri.length && alarmToplamSayfa > 1 && (
                        <View style={styles.sayfalamaNavigasyonSatiri}>
                          <TouchableOpacity style={styles.sayfaGezmeButon} disabled={alarmMevcutSayfa === 1} onPress={() => setAlarmMevcutSayfa(alarmMevcutSayfa - 1)}>
                            <Text style={[styles.sayfaGezmeYazi, alarmMevcutSayfa === 1 && { opacity: 0.4 }]}>◀️ Geri</Text>
                          </TouchableOpacity>
                          <Text style={styles.sayfaNumaraYazisi}>{alarmMevcutSayfa} / {alarmToplamSayfa}</Text>
                          <TouchableOpacity style={styles.sayfaGezmeButon} disabled={alarmMevcutSayfa === alarmToplamSayfa} onPress={() => setAlarmMevcutSayfa(alarmMevcutSayfa + 1)}>
                            <Text style={[styles.sayfaGezmeYazi, alarmMevcutSayfa === alarmToplamSayfa && { opacity: 0.4 }]}>İleri ▶️</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              )}

              <View style={[styles.adminBlok, { marginTop: 15, marginBottom: 20 }]}>
                <Text style={styles.blokBaslik}>📋 Kayıtlı Kurum Evrakları ({filtrelenmisAdminIsletmeler.length})</Text>
                <TextInput style={styles.adminAramaBar} placeholder="🔍 Kurum adına göre süzün..." placeholderTextColor="#6c757d" value={adminAramaMetni} onChangeText={setAdminAramaMetni} />

                <View style={styles.manuelLimitSatiri}>
                  <Text style={[styles.inputEtiket, { marginBottom: 0, flex: 2, color: '#333' }]}>Sayfa Başına Gösterim:</Text>
                  <TextInput style={styles.manuelLimitInputKutusu} value={adminLimitInput} onChangeText={setAdminLimitInput} keyboardType="numeric" />
                </View>

                {sayfalanmisAdminIsletmeler.map(item => (
                  <View key={item.id} style={styles.adminSatirKart}>
                    <Text style={{fontWeight:'bold', color:'#00205B', flex: 1}}>{item.ad} {item.dosyaUrl ? '📎' : ''}</Text>
                    <View style={styles.adminAksiyonGrup}>
                      <TouchableOpacity style={styles.duzenleIkonButon} onPress={() => duzenleModunuAc(item)}><Text style={{fontSize: 12, color: '#00205B'}}>✏️ Düzenle</Text></TouchableOpacity>
                      <TouchableOpacity style={styles.silIkonButon} onPress={() => kurumuVeritabanindanSil(item.id, item.ad)}><Text style={{fontSize: 12, color: '#fff', fontWeight: 'bold'}}>🗑️ Sil</Text></TouchableOpacity>
                    </View>
                  </View>
                ))}

                {adminLimit < siraliAdminIsletmeler.length && adminToplamSayfa > 1 && (
                  <View style={styles.sayfalamaNavigasyonSatiri}>
                    <TouchableOpacity style={styles.sayfaGezmeButon} disabled={adminMevcutSayfa === 1} onPress={() => setAdminMevcutSayfa(adminMevcutSayfa - 1)}>
                      <Text style={[styles.sayfaGezmeYazi, adminMevcutSayfa === 1 && {opacity: 0.4}]}>◀️ Geri</Text>
                    </TouchableOpacity>
                    <Text style={styles.sayfaNumaraYazisi}>{adminMevcutSayfa} / {adminToplamSayfa}</Text>
                    <TouchableOpacity style={styles.sayfaGezmeButon} disabled={adminMevcutSayfa === adminToplamSayfa} onPress={() => setAdminMevcutSayfa(adminMevcutSayfa + 1)}>
                      <Text style={[styles.sayfaGezmeYazi, adminMevcutSayfa === adminToplamSayfa && {opacity: 0.4}]}>İleri ▶️</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              <Text style={styles.copyrightMetni}>© CG</Text>
            </View>
          )}
        </View>
      )}

      {/* MODALLAR */}
      <Modal visible={dropdownAcikMi} transparent={true} animationType="fade">
        <View style={styles.modalArkaPlan}>
          <View style={styles.dropdownMenuKonteynerGenisletilmis}>
            <Text style={styles.modalBaslikYazisi}>📂 Kategori Yönetimi & Seçimi</Text>
            <ScrollView style={styles.modalDikeyKaydirmaAlani} showsVerticalScrollIndicator={true}>
              {kategoriler.map(kat => (
                <View key={kat.id} style={styles.kategoriYonetimEsnekSatiri}>
                  <TouchableOpacity style={{ flex: 1, paddingVertical: 10, paddingRight: 10 }} onPress={() => { setFormSeciliKategori(kat.name); setDropdownAcikMi(false); }}>
                    <Text style={{ color: '#333', fontWeight: formSeciliKategori === kat.name ? 'bold' : 'normal', fontSize: 14 }}>{formSeciliKategori === kat.name ? '🔹 ' : '📁 '} {kat.name}</Text>
                  </TouchableOpacity>
                  <View style={styles.katKucukButonGrupKapsul}>
                    <TouchableOpacity style={styles.katKucukDuzenleButon} onPress={() => kategoriDuzenle(kat)}><Text style={{ fontSize: 12, fontWeight: '600', color: '#00205B' }}>✏️ Düzenle</Text></TouchableOpacity>
                    <TouchableOpacity style={styles.katKucukSilButon} onPress={() => kategoriSil(kat)}><Text style={{ fontSize: 12, fontWeight: '600', color: '#FF3B30' }}>🗑️ Sil</Text></TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity style={[styles.dropdownKapatButon, { backgroundColor: '#00205B', marginTop: 15 }]} onPress={() => setDropdownAcikMi(false)}><Text style={{ color: '#fff', fontWeight: 'bold' }}>Pencereyi Kapat</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={uyeDropdownAcikMi} transparent={true} animationType="fade">
        <View style={styles.modalArkaPlan}>
          <View style={styles.dropdownMenuKonteyner}>
            <Text style={styles.modalBaslikYazOriginal}>Filtrelemek İstediğiniz Kategori</Text>
            <ScrollView style={styles.modalDikeyKaydirmaAlani} showsVerticalScrollIndicator={true}>
              <TouchableOpacity style={[styles.dropdownMenuSatir, seciliKategoriFiltre === 'Hepsi' && { backgroundColor: '#e2f0f2' }]} onPress={() => { setSeciliKategoriFiltre('Hepsi'); setUyeDropdownAcikMi(false); }}><Text style={{ color: '#007A87', fontWeight: 'bold' }}>✨ Hepsi (Tüm Kurumlar)</Text></TouchableOpacity>
              {kategoriler.map(kat => (
                <TouchableOpacity key={kat.id} style={[styles.dropdownMenuSatir, seciliKategoriFiltre === kat.name && { backgroundColor: '#e2f0f2' }]} onPress={() => { setSeciliKategoriFiltre(kat.name); setUyeDropdownAcikMi(false); }}><Text style={{ color: '#333', fontWeight: seciliKategoriFiltre === kat.name ? 'bold' : 'normal' }}>📂 {kat.name}</Text></TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={[styles.dropdownKapatButon, { backgroundColor: '#00205B', marginTop: 15 }]} onPress={() => setUyeDropdownAcikMi(false)}><Text style={{ color:'#fff', fontWeight:'bold' }}>Pencereyi Kapat</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={yanMenuAcikMi} transparent={true} animationType="slide">
        <View style={styles.sidebarArkaPlan}>
          <View style={styles.sidebarGövde}>
            <View style={styles.sidebarUstKisim}>
              <Text style={styles.sidebarBaslik}>📋 Menü</Text>
              <TouchableOpacity onPress={() => setYanMenuAcikMi(false)}><Text style={{ fontSize: 20, color: '#FF3B30', fontWeight: 'bold' }}>✕</Text></TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.sidebarMenuButonSatiri} onPress={() => { setSosyalModalAcikMi(true); setYanMenuAcikMi(false); }}><Text style={styles.sidebarMenuMetni}>🌐 Kurumsal İletişim & Sosyal Ayarlar</Text></TouchableOpacity>
            <TouchableOpacity style={styles.sidebarMenuButonSatiri} onPress={() => { setYonetimModalAcikMi(true); setYanMenuAcikMi(false); }}><Text style={styles.sidebarMenuMetni}>👥 Yönetim Kurulu Kadrosu Ayarı</Text></TouchableOpacity>
            <TouchableOpacity style={styles.sidebarMenuButonSatiri} onPress={() => { setMesajModalAcikMi(true); setYanMenuAcikMi(false); }}><Text style={styles.sidebarMenuMetni}>✉️ Başkanın Mesajı Ayarı</Text></TouchableOpacity>
            <TouchableOpacity style={styles.sidebarMenuButonSatiri} onPress={() => { setSifreModalAcikMi(true); setYanMenuAcikMi(false); }}><Text style={styles.sidebarMenuMetni}>🔐 Giriş Şifresini Değiştir</Text></TouchableOpacity>
            <View style={{ flex: 1 }} />
            <TouchableOpacity style={[styles.cikisButon, { margin: 15 }]} onPress={adminCikisYap}><Text style={[styles.cikisButonYazi, { textAlign: 'center' }]}>Güvenli Çıkış</Text></TouchableOpacity>
          </View>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setYanMenuAcikMi(false)} />
        </View>
      </Modal>

      <Modal visible={sosyalModalAcikMi} transparent={true} animationType="fade">
        <View style={styles.modalArkaPlan}>
          <View style={[styles.dropdownMenuKonteyner, { width: 360 }]}>
            <Text style={styles.modalBaslikYazisi}>🌐 Kurumsal İletişim Entegrasyonu</Text>
            <Text style={styles.inputEtiket}>Facebook Sayfa Linki</Text>
            <TextInput style={styles.inputField} value={inputFb} onChangeText={setInputFb} placeholder="facebook.com/sayfaniz" placeholderTextColor="#999" />
            <Text style={styles.inputEtiket}>Twitter / 𝕏 Profil Linki</Text>
            <TextInput style={styles.inputField} value={inputX} onChangeText={setInputX} placeholder="x.com/kullaniciadi" placeholderTextColor="#999" />
            <Text style={styles.inputEtiket}>Instagram Profil Linki</Text>
            <TextInput style={styles.inputField} value={inputInsta} onChangeText={setInputInsta} placeholder="instagram.com/kullaniciadi" placeholderTextColor="#999" />
            <Text style={styles.inputEtiket}>linkedin Kanal Linki</Text>
            <TextInput style={styles.inputField} value={inputYt} onChangeText={setInputYt} placeholder="https://tr.linkedin.com/in/kanali" placeholderTextColor="#999" />
            <Text style={styles.inputEtiket}>WhatsApp Telefon Numarası / Grup Linki</Text>
            <TextInput style={styles.inputField} value={inputWa} onChangeText={setInputWa} placeholder="Örn Link veya 532xxxxxxx" placeholderTextColor="#999" />
            <Text style={styles.inputEtiket}>Kurumsal Ofis / Dernek Adresi</Text>
            <TextInput style={styles.inputField} value={inputAdres} onChangeText={setInputAdres} placeholder="Örn: Merkez, Ordu" placeholderTextColor="#999" />
            <View style={styles.satir}>
              <TouchableOpacity style={[styles.kaydetButon, { flex: 2, marginTop: 0, backgroundColor: '#00205B' }]} onPress={sosyalMedyaAyarlariniKaydet}><Text style={styles.kaydetButonYazi}>💾 Ayarları Kaydet</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.dropdownKapatButon, { flex: 1, marginTop: 0, marginLeft: 6, backgroundColor: '#6c757d' }]} onPress={() => setSosyalModalAcikMi(false)}><Text style={{ color: '#fff', fontWeight: 'bold' }}>İptal</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={sifreModalAcikMi} transparent={true} animationType="fade">
        <View style={styles.modalArkaPlan}>
          <View style={[styles.dropdownMenuKonteyner, { width: 330 }]}>
            <Text style={styles.modalBaslikYazisi}>🔐 Yönetici Giriş Şifresi Güncelleme</Text>
            <Text style={styles.inputEtiket}>Yeni Giriş Şifresi</Text>
            <TextInput style={styles.inputField} value={yeniSifreInput} onChangeText={setYeniSifreInput} placeholder="Yeni şifre belirleyin..." placeholderTextColor="#999" secureTextEntry={true} />
            <View style={[styles.satir, { marginTop: 10 }]}>
              <TouchableOpacity style={[styles.kaydetButon, { flex: 2, marginTop: 0, backgroundColor: '#00205B' }]} onPress={sifreyiGuncelle}><Text style={styles.kaydetButonYazi}>🔐 Güncelle</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.dropdownKapatButon, { flex: 1, marginTop: 0, marginLeft: 6, backgroundColor: '#6c757d' }]} onPress={() => setSifreModalAcikMi(false)}><Text style={{ color: '#fff', fontWeight: 'bold' }}>İptal</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={yonetimModalAcikMi} transparent={true} animationType="fade">
        <View style={styles.modalArkaPlan}>
          <View style={[styles.dropdownMenuKonteynerGenisletilmis, { maxHeight: '85%' }]}>
            <Text style={styles.modalBaslikYazisi}>👥 Dynamic Kadro Ayarları (Ağaç Modeli Düzeni)</Text>
            
            <ScrollView style={{ flex: 1, paddingRight: 4 }} showsVerticalScrollIndicator={true}>
              {formYonetimListesi.map((govevli, idx) => (
                <View key={idx} style={styles.yardimciDinamikGirisKart}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, borderBottom: '1px solid #e2e8f0', paddingBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 'bold', color: '#007A87' }}>👤 {idx + 1}. Görevli Bilgileri</span>
                    <button onClick={() => dinamikKadroSatirSil(idx)} style={{ color: '#FF3B30', background: 'none', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>✕ Kaldır</button>
                  </div>
                  
                  <Text style={styles.inputEtiket}>Adı Soyadı</Text>
                  <TextInput style={styles.inputField} value={govevli.ad} onChangeText={(t) => dinamikKadroHücreDegis(t, idx, 'ad')} placeholder="Görevlinin Adı Soyadı" placeholderTextColor="#999" />
                  
                  <View style={styles.satir}>
                    <View style={{ flex: 2, marginRight: 6 }}>
                      <Text style={styles.inputEtiket}>Görevi / Unvanı</Text>
                      <TextInput style={styles.inputField} value={govevli.gorev} onChangeText={(t) => dinamikKadroHücreDegis(t, idx, 'gorev')} placeholder="Örn: Başkan, Başkan Yardımcısı, Eğitim Sorumlusu, Üye" placeholderTextColor="#999" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputEtiket}>Sıra No</Text>
                      <TextInput style={styles.inputField} value={govevli.sira} onChangeText={(t) => dinamikKadroHücreDegis(t, idx, 'sira')} placeholder="Örn: 1" keyboardType="numeric" placeholderTextColor="#999" />
                    </View>
                  </View>

                  <Text style={styles.inputEtiket}>Profil Fotoğrafı</Text>
                  <View style={styles.dosyaYuklemeKapsayiciSatir}>
                    <TouchableOpacity style={[styles.dosyaYukleKutusu, { flex: 1, marginBottom: 0, padding: 8 }]} onPress={() => { if(Platform.OS === 'web') { document.getElementById(`dinamikKadroInput-${idx}`).click(); } }}><Text style={[styles.dosyaYukleYazisi, { fontSize: 12 }]} numberOfLines={1}>{govevli.foto ? '📸 Fotoğrafı Değiştir' : '📂 Profil Resmi Seç'}</Text></TouchableOpacity>
                    {govevli.foto ? (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Image source={{ uri: govevli.foto }} style={{ width: 36, height: 36, borderRadius: 18 }} />
                        <TouchableOpacity style={[styles.dosyaKaldırKırmızıButon, { height: 36, paddingHorizontal: 10 }]} onPress={() => dinamikKadroHücreDegis('', idx, 'foto')}><Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>Sil</Text></TouchableOpacity>
                      </View>
                    ) : null}
                  </View>
                </View>
              ))}
            </ScrollView>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10, marginBottom: 10 }}>
              <button onClick={dinamikKadroSatirEkle} style={{ width: '100%', backgroundColor: '#4B9B28', color: '#fff', border: 'none', padding: '10px 14px', borderRadius: 8, fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>➕ Listeye Yeni Görevli Ekle</button>
            </div>

            <View style={[styles.satir, { marginTop: 5 }]}>
              <TouchableOpacity style={[styles.kaydetButon, { flex: 2, marginTop: 0, backgroundColor: '#00205B' }]} onPress={yonetimKurulunuKaydet}><Text style={styles.kaydetButonYazi}>💾 Kadroyu Buluta İşle</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.dropdownKapatButon, { flex: 1, marginTop: 0, marginLeft: 6, backgroundColor: '#6c757d' }]} onPress={() => setYonetimModalAcikMi(false)}><Text style={{ color: '#fff', fontWeight: 'bold' }}>Kapat</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={mesajModalAcikMi} transparent={true} animationType="fade">
        <View style={styles.modalArkaPlan}>
          <View style={[styles.dropdownMenuKonteyner, { width: 440 }]}>
            <Text style={styles.modalBaslikYazisi}>✉️ Başkanın Mesajını Düzenle</Text>
            <Text style={styles.inputEtiket}>Kurumsal Hitap ve Mesaj Metni</Text>
            <TextInput style={[styles.inputField, { height: 160, textAlignVertical: 'top', paddingTop: 10 }]} multiline={true} value={inputMesaj} onChangeText={setInputMesaj} placeholder="Üyelere iletilecek mesaj metnini buraya yazın..." placeholderTextColor="#999" />
            <View style={[styles.satir, { marginTop: 15 }]}>
              <TouchableOpacity style={[styles.kaydetButon, { flex: 2, marginTop: 0, backgroundColor: '#00205B' }]} onPress={baskanMesajiniKaydet}><Text style={styles.kaydetButonYazi}>💾 Mesajı Buluta Kaydet</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.dropdownKapatButon, { flex: 1, marginTop: 0, marginLeft: 6, backgroundColor: '#6c757d' }]} onPress={() => setMesajModalAcikMi(false)}><Text style={{ color: '#fff', fontWeight: 'bold' }}>İptal</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </ScrollView>
    
  );
}

const logoStyles = StyleSheet.create({
  logoMerkezKonteyner: { flexDirection: 'column', alignItems: 'center', marginVertical: 10 },
  logoMetinAlani: { flexDirection: 'column', alignItems: 'center', marginTop: 5 },
  logoDaireGrup: { width: 100, height: 100, position: 'relative', justifyContent: 'center', alignItems: 'center' },
  insanKafa: { width: 10, height: 10, borderRadius: 5, position: 'absolute', zIndex: 3 },
  insanGövde: { width: 26, height: 18, borderRadius: 13, borderStyle: 'solid', position: 'absolute', zIndex: 2 },
  logoAnaYazi: { fontSize: 32, fontWeight: '900', color: '#00205B', letterSpacing: 4, textAlign: 'center', fontFamily: 'sans-serif' },
  logoAltYazi: { fontSize: 11, fontWeight: '700', color: '#00205B', letterSpacing: 2.2, marginTop: 4, textAlign: 'center', fontFamily: 'sans-serif' }
});

const styles = StyleSheet.create({
  anaScrollKonteyner: { flex: 1, backgroundColor: '#EBF0F5', ...Platform.select({ web: { overflowY: 'auto' } }) },
  anaScrollIcerik: { paddingHorizontal: '2%', alignSelf: 'center', width: '100%', maxWidth: 1200, paddingBottom: 30 },
  anaLogoAlani: { alignItems: 'center', marginTop: 40, marginBottom: 10, width: '100%' },
  ustAksiyonBari: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 10, position: 'relative', zIndex: 99 },
  hamburgerMenuAlaniKapsul: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  hamburgerMenuButon: { padding: 10, ...Platform.select({ web: { cursor: 'pointer' } }), position: 'relative', zIndex: 999 },
  navBar: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 10, padding: 5, marginBottom: 20, borderWidth: 1, borderColor: '#cbd5e1' },
  navButon: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  aktifNav: { backgroundColor: '#00205B' },
  navYazi: { color: '#475569', fontWeight: 'bold' },
  aramaBar: { backgroundColor: '#FFFFFF', padding: 12, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#cbd5e1', color: '#333' },
  kart: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 15, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#cbd5e1' },
  kartSol: { flex: 1 },
  kartIsim: { fontSize: 17, fontWeight: 'bold', color: '#00205B', marginBottom: 4 },
  kartKategori: { fontSize: 13, color: '#007A87', fontWeight: '600', marginBottom: 4 },
  tarihEtiket: { fontSize: 11, color: '#64748b', marginBottom: 6 },
  evrakButon: { backgroundColor: '#e0f2fe', padding: 6, borderRadius: 6, alignSelf: 'flex-start', borderWidth: 1, borderColor: '#bae6fd', marginTop: 4 },
  evrakButonYazi: { color: '#0369a1', fontSize: 11, fontWeight: 'bold' },
  kartSagKonteyner: { alignItems: 'center', gap: 6, minWidth: 100, justifyContent: 'center' },
  yolTarifiButon: { backgroundColor: '#007A87', paddingVertical: 5, paddingHorizontal: 8, borderRadius: 6, width: 90, alignItems: 'center' },
  yolTarifiYazi: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  adminBlok: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 15, borderWidth: 1, borderColor: '#cbd5e1' },
  akordeonBaslikAlani: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 5, ...Platform.select({ web: { cursor: 'pointer' } }) },
  blokBaslik: { fontSize: 16, fontWeight: 'bold', color: '#00205B', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingBottom: 5 },
  blokBaslikDokunmatik: { fontSize: 16, fontWeight: 'bold', color: '#00205B' },
  akordeonIcon: { fontSize: 14, color: '#00205B', fontWeight: 'bold' },
  dosyaYuklemeKapsayiciSatir: { flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 12 },
  dosyaYukleKutusu: { backgroundColor: '#f8fafc', borderStyle: 'dashed', borderWidth: 2, borderColor: '#00205B', padding: 12, borderRadius: 8, alignItems: 'center', ...Platform.select({ web: { cursor: 'pointer' } }) },
  dosyaYukleYazisi: { color: '#00205B', fontWeight: 'bold', fontSize: 13 },
  dosyaKaldırKırmızıButon: { backgroundColor: '#FF3B30', height: 42, justifyContent: 'center', paddingHorizontal: 15, borderRadius: 8, ...Platform.select({ web: { cursor: 'pointer' } }) },
  inputEtiket: { color: '#334155', fontSize: 12, fontWeight: '600', marginBottom: 6 },
  inputField: { backgroundColor: '#EBF0F5', padding: 10, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#cbd5e1', color: '#333' },
  satir: { flexDirection: 'row' },
  secenekButon: { flex: 1, backgroundColor: '#EBF0F5', padding: 10, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#cbd5e1' },
  secenekButonAktif: { backgroundColor: '#fff', borderColor: '#00205B' },
  kaydetButon: { backgroundColor: '#00205B', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  kaydetButonYazi: { color: '#fff', fontWeight: 'bold' },
  dropdownKutusu: { backgroundColor: '#EBF0F5', height: 40, justifyContent: 'center', paddingHorizontal: 12, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#cbd5e1' },
  dropdownKutusuYazisi: { color: '#333' },
  adminSatirKart: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  duzenleIkonButon: { backgroundColor: '#f1f5f9', padding: 6, borderRadius: 6, borderWidth: 1, borderColor: '#cbd5e1', marginRight: 6, ...Platform.select({ web: { cursor: 'pointer' } }) },
  silIkonButon: { backgroundColor: '#FF3B30', padding: 6, borderRadius: 6, borderWidth: 1, borderColor: '#FF3B30', ...Platform.select({ web: { cursor: 'pointer' } }) },
  modalArkaPlan: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  dropdownMenuKonteyner: { backgroundColor: '#fff', width: 320, padding: 20, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 5 },
  modalBaslikYazisi: { fontSize: 14, fontWeight: 'bold', color: '#00205B', marginBottom: 15, textAlign: 'center', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: 8 },
  modalBaslikYazOriginal: { fontSize: 14, fontWeight: 'bold', color: '#00205B', marginBottom: 15, textAlign: 'center' },
  modalDikeyKaydirmaAlani: { maxHeight: 220 },
  dropdownMenuSatir: { paddingVertical: 12, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  dropdownKapatButon: { alignItems: 'center', padding: 12, borderRadius: 8, ...Platform.select({ web: { cursor: 'pointer' } }) },
  loginKonteyner: { padding: 20 },
  loginBaslik: { fontSize: 18, fontWeight: 'bold', color: '#00205B', marginBottom: 15, textAlign: 'center' },
  onizlemePanelSube: { backgroundColor: '#f8fafc', padding: 10, borderRadius: 8, marginBottom: 12, marginTop: -4, borderWidth: 1, borderColor: '#cbd5e1' },
  onizlemeBilgiYazi: { fontSize: 11, fontWeight: 'bold', color: '#475569', marginBottom: 5 },
  onizlemeAksiyonButon: { flex: 1, backgroundColor: '#007A87', paddingVertical: 6, borderRadius: 6, alignItems: 'center', marginRight: 5, borderWidth: 1, borderColor: '#007A87' },
  onizlemeButonMetni: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  adminAramaBar: { backgroundColor: '#EBF0F5', padding: 10, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: '#cbd5e1', color: '#333' },
  adminAksiyonGrup: { flexDirection: 'row', alignItems: 'center' },
  cikisButon: { backgroundColor: '#FF3B30', padding: 10, borderRadius: 8 },
  cikisButonYazi: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  manuelLimitSatiri: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 10, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: '#cbd5e1' },
  manuelLimitInputKutusu: { backgroundColor: '#EBF0F5', color: '#4B9B28', width: 70, height: 36, borderRadius: 6, borderWidth: 1, borderColor: '#cbd5e1', textAlign: 'center', fontWeight: 'bold', fontSize: 15 },
  sayfalamaNavigasyonSatiri: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  sayfaGezmeButon: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#cbd5e1', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, minWidth: 70, alignItems: 'center' },
  sayfaGezmeYazi: { color: '#333', fontSize: 12, fontWeight: 'bold' },
  sayfaNumaraYazisi: { color: '#334155', fontSize: 13, fontWeight: 'bold' },
  elleKategoriBlok: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EBF0F5', padding: 6, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#cbd5e1' },
  elleKategoriEkleButon: { backgroundColor: '#4B9B28', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 6, marginLeft: 8 },
  sidebarArkaPlan: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', flexDirection: 'row' },
  sidebarGövde: { backgroundColor: '#fff', width: 280, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 10, elevation: 10 },
  sidebarUstKisim: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', backgroundColor: '#f8fafc' },
  sidebarBaslik: { fontSize: 16, fontWeight: 'bold', color: '#00205B' },
  sidebarMenuButonSatiri: { padding: 18, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', backgroundColor: '#fff', ...Platform.select({ web: { cursor: 'pointer' } }) },
  sidebarMenuMetni: { fontSize: 14, color: '#334155', fontWeight: '600' },
  kurumsalFooterSeridi: { backgroundColor: '#F4F6F9', paddingVertical: 20, borderRadius: 12, marginTop: 25, marginBottom: 5, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  footerIkonSatiri: { flexDirection: 'row', gap: 30, justifyContent: 'center', alignItems: 'center', width: '100%', flexWrap: 'wrap' },
  orjinalFooterKapsul: { alignItems: 'center', gap: 4, minWidth: 65 },
  orjinalFooterMetin: { color: '#00205B', fontSize: 11, fontWeight: '600', fontFamily: 'sans-serif' },
  copyrightMetni: { textAlign: 'center', fontSize: 11, color: '#64748b', fontWeight: 'bold', marginVertical: 10, letterSpacing: 1 },
  yonetimAltGrupBaslik: { fontSize: 13, fontWeight: 'bold', color: '#00205B', marginTop: 10, marginBottom: 5 },
  ayracCizgisiMenu: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 12, width: '100%' },
  yardimciArtiEkleKapsulButon: { backgroundColor: '#4B9B28', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  yardimciDinamikGirisKart: { backgroundColor: '#f8fafc', padding: 10, borderRadius: 10, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  kurumsalYonetimKadroBloku: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#cbd5e1', marginTop: 20, width: '100%' },
  yonetimKadroBaslik: { fontSize: 14, fontWeight: '800', color: '#00205B', letterSpacing: 1.5, flex: 1 },
  baskanKartGövde: { alignItems: 'center', marginBottom: 25, backgroundColor: '#f8fafc', padding: 15, borderRadius: 12, minWidth: 220, borderWidth: 1, borderColor: '#e2e8f0' },
  baskanProfilCerceve: { width: 74, height: 74, borderRadius: 37, backgroundColor: '#EBF0F5', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', marginBottom: 10, borderWidth: 2, borderColor: '#00205B' },
  kadroProfilResmi: { width: '100%', height: '100%', resizeMode: 'cover' },
  yardimcilarKonteynerMatris: { flexDirection: 'row', flexWrap: 'wrap', gap: 15, justifyContent: 'center', width: '100%', marginTop: 10 },
  yardimciMiniKart: { backgroundColor: '#f8fafc', width: 140, padding: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#cbd5e1' },
  yardimciIsimMetni: { fontSize: 13, fontWeight: '700', color: '#00205B', textAlign: 'center' },
  baskanMesajIcerikKonteyner: { width: '100%', marginTop: 15, paddingHorizontal: 10, paddingTop: 5 },
  baskanMesajTekstHizalama: { fontSize: 14, color: '#334155', lineHeight: 22, textAlign: 'justify', fontWeight: '500', fontFamily: 'sans-serif' },
  dropdownMenuKonteynerGenisletilmis: { backgroundColor: '#fff', width: 520, maxWidth: '95%', padding: 20, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 5 },
  kategoriYonetimEsnekSatiri: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingRight: 4 },
  katKucukButonGrupKapsul: { flexDirection: 'row', gap: 6, alignItems: 'center', width: 'auto' },
  katKucukDuzenleButon: { backgroundColor: '#e2f0f2', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6, minWidth: 70, alignItems: 'center' },
  katKucukSilButon: { backgroundColor: '#fee2e2', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6, minWidth: 60, alignItems: 'center' },
  agacKatmanAlani: { width: '100%', alignItems: 'center', marginVertical: 10 },
  agacKatmanEtiketi: { fontSize: 11, color: '#64748b', fontWeight: '800', letterSpacing: 1, marginBottom: 8, backgroundColor: '#f1f5f9', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  agacBaglantiCizgisi: { width: 2, height: 20, backgroundColor: '#cbd5e1', marginTop: 12 },
  kadroUnvanMetni: { fontSize: 11, fontWeight: '700', marginTop: 4, textAlign: 'center' },
  kartSag: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0fdf4', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, minWidth: 90, maxWidth: 140, borderColor: '#bbf7d0', borderWidth: 1, marginBottom: 4 },
  indirimOrani: { fontSize: 12, fontWeight: 'bold', color: '#4B9B28', textAlign: 'center', lineHeight: 15 },
  indirimEtiket: { fontSize: 9, color: '#475569', fontWeight: 'bold', marginTop: 2 }
});