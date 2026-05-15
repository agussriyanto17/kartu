import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, 
  Download, 
  Upload, 
  UserCheck, 
  FileText, 
  ShieldCheck, 
  RefreshCw,
  IdCard,
  Printer,
  Database,
  GraduationCap,
  Camera,
  CheckCircle2,
  ChevronLeft
} from 'lucide-react';

// Konfigurasi Default Sekolah SMK
const SCHOOL_CONFIG = {
  name: "SMK Canda Bhirawa Pare",
  province: "YAYASAN CANDA BHIRAWA",
  year: "2025/2026",
  examName: "UJIAN SUMATIF GENAP",
  logo: "https://lh3.googleusercontent.com/d/1Fy6-574_ErtmAMtMYqrHmSy-4Ngq9VsO"
};

export default function App() {
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [xlsxLoaded, setXlsxLoaded] = useState(false);
  const [html2canvasLoaded, setHtml2canvasLoaded] = useState(false);
  const cardRef = useRef(null);

  // Load library eksternal
  useEffect(() => {
    const xlsxScript = document.createElement('script');
    xlsxScript.src = "https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js";
    xlsxScript.async = true;
    xlsxScript.onload = () => setXlsxLoaded(true);
    document.body.appendChild(xlsxScript);

    const h2cScript = document.createElement('script');
    h2cScript.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
    h2cScript.async = true;
    h2cScript.onload = () => setHtml2canvasLoaded(true);
    document.body.appendChild(h2cScript);

    return () => {
      if (document.body.contains(xlsxScript)) document.body.removeChild(xlsxScript);
      if (document.body.contains(h2cScript)) document.body.removeChild(h2cScript);
    };
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !window.XLSX) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = window.XLSX.read(bstr, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = window.XLSX.utils.sheet_to_json(ws);
        
        const sanitizedData = data.map(item => ({
          Nama: item.Nama || item.nama || "",
          NISN: item.NISN || item.nisn || "",
          Jurusan: item.Jurusan || item.Program_Keahlian || "Semua Jurusan",
          Ruang: item.Ruang || "01",
          Nomor_Peserta: item.Nomor_Peserta || item.No_Ujian || "00-000-000",
          Foto: item.Foto || ""
        }));

        setStudents(sanitizedData);
        setIsAdmin(false);
      } catch (err) {
        console.error("Gagal membaca file:", err);
      }
    };
    reader.readAsBinaryString(file);
  };

  const filteredStudents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query || query.length < 2) return [];
    return students.filter(s => 
      s.Nama.toLowerCase().includes(query) || 
      s.NISN.toString().includes(query)
    ).slice(0, 5);
  }, [searchQuery, students]);

  const downloadCard = () => {
    if (!cardRef.current || !window.html2canvas) return;

    window.html2canvas(cardRef.current, {
      scale: 3, 
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false
    }).then(canvas => {
      const link = document.createElement('a');
      link.download = `KARTU_${selectedStudent.Nama.replace(/\s+/g, '_')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900 overflow-x-hidden pb-10">
      {/* Header Aplikasi - Mirip App Android */}
      <header className="bg-blue-700 text-white px-5 py-4 sticky top-0 z-50 shadow-md flex justify-between items-center">
        <div className="flex items-center gap-3">
          {selectedStudent ? (
            <button onClick={() => setSelectedStudent(null)} className="p-1 -ml-1">
              <ChevronLeft size={28} />
            </button>
          ) : (
            <GraduationCap size={28} />
          )}
          <div>
            <h1 className="font-bold text-lg leading-tight">SMK-Digital</h1>
            <p className="text-[10px] opacity-80 font-medium uppercase tracking-wider">Canda Bhirawa Pare</p>
          </div>
        </div>
        <button 
          onClick={() => setIsAdmin(!isAdmin)}
          className="p-2 bg-white/10 rounded-full active:bg-white/20 transition-colors"
        >
          <ShieldCheck size={20} />
        </button>
      </header>

      <main className="p-5 max-w-lg mx-auto">
        {isAdmin ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Database className="text-blue-600" />
              </div>
              <h2 className="text-xl font-bold mb-2">Panel Operator</h2>
              <p className="text-slate-500 text-xs mb-6 uppercase font-bold tracking-widest">Update Data Peserta</p>
              
              <label className="w-full cursor-pointer flex flex-col items-center gap-3 bg-slate-900 text-white p-6 rounded-2xl font-bold transition-all active:scale-95">
                <Upload size={24} />
                <span>Klik untuk Upload Excel</span>
                <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleFileUpload} />
              </label>

              {students.length > 0 && (
                <div className="mt-6 p-4 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-bold flex items-center justify-center gap-2">
                  <CheckCircle2 size={18} />
                  {students.length} Siswa Siap Diakses
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {!selectedStudent && (
              <div className="animate-in fade-in duration-500">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-black text-slate-800">Cetak Kartu Ujian</h2>
                  <p className="text-slate-500 text-sm mt-1">Gunakan NISN atau Nama Lengkap</p>
                </div>

                <div className="relative">
                  <div className="bg-white p-2 rounded-2xl shadow-lg border border-slate-100 flex items-center gap-2 mb-4 ring-2 ring-blue-100">
                    <div className="pl-3 text-blue-600">
                      <Search size={22} />
                    </div>
                    <input 
                      type="text" 
                      placeholder="Masukkan Nama/NISN..."
                      className="w-full py-3 pr-4 focus:outline-none font-bold text-slate-700"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  {filteredStudents.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden divide-y divide-slate-50">
                      {filteredStudents.map((s, idx) => (
                        <button 
                          key={idx}
                          onClick={() => {
                            setSelectedStudent(s);
                            setSearchQuery('');
                          }}
                          className="w-full text-left p-4 hover:bg-blue-50 active:bg-blue-100 flex items-center gap-4 transition-all"
                        >
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-blue-600 font-bold">
                            {s.Nama.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{s.Nama}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">{s.Jurusan}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {selectedStudent && (
              <div className="animate-in zoom-in-95 duration-300 space-y-6">
                {/* Visual Kartu */}
                <div 
                  ref={cardRef}
                  className="bg-white w-full rounded-xl overflow-hidden shadow-2xl relative border border-slate-200"
                  style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }} 
                >
                  <div className="bg-[#003366] p-3 flex items-center gap-3 border-b-4 border-yellow-400">
                    <img src={SCHOOL_CONFIG.logo} alt="Logo" className="w-10 h-10 object-contain" />
                    <div className="text-white text-left">
                      <h4 className="text-[7px] font-bold uppercase tracking-wider opacity-80 leading-none mb-1">{SCHOOL_CONFIG.province}</h4>
                      <h5 className="text-[11px] font-black uppercase leading-tight">{SCHOOL_CONFIG.name}</h5>
                      <p className="text-[7px] font-bold opacity-60 uppercase mt-0.5">{SCHOOL_CONFIG.examName}</p>
                    </div>
                  </div>

                  <div className="p-4 flex gap-4 bg-white relative min-h-[160px]">
                    <div className="shrink-0 flex flex-col items-center gap-2">
                      <div className="w-24 h-32 bg-slate-50 border border-slate-200 rounded-md overflow-hidden flex items-center justify-center">
                        {selectedStudent.Foto ? (
                          <img src={selectedStudent.Foto} className="w-full h-full object-cover" />
                        ) : (
                          <Camera size={24} className="text-slate-300" />
                        )}
                      </div>
                    </div>

                    <div className="flex-1 space-y-2 text-left">
                      <div>
                        <span className="text-[7px] font-bold text-blue-600 uppercase">Nama Peserta</span>
                        <p className="text-xs font-black text-slate-800 uppercase leading-none">{selectedStudent.Nama}</p>
                      </div>
                      
                      <div className="space-y-1.5">
                        <div>
                          <span className="text-[7px] font-bold text-slate-400 uppercase">Jurusan</span>
                          <p className="text-[9px] font-bold text-slate-700 leading-tight">{selectedStudent.Jurusan}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-[7px] font-bold text-slate-400 uppercase">No. Peserta</span>
                            <p className="text-[9px] font-bold text-blue-700">{selectedStudent.Nomor_Peserta}</p>
                          </div>
                          <div>
                            <span className="text-[7px] font-bold text-slate-400 uppercase">NISN</span>
                            <p className="text-[9px] font-bold text-slate-700">{selectedStudent.NISN}</p>
                          </div>
                        </div>
                        <div>
                          <span className="text-[7px] font-bold text-slate-400 uppercase">Ruang / Sesi</span>
                          <p className="text-[9px] font-bold text-slate-700">{selectedStudent.Ruang} / Sesi 1</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="h-1 bg-gradient-to-r from-blue-900 via-blue-600 to-yellow-400"></div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <button 
                    onClick={downloadCard}
                    className="flex items-center justify-center gap-3 bg-blue-600 text-white p-4 rounded-2xl font-bold active:scale-95 transition-transform"
                  >
                    <Download size={20} />
                    SIMPAN KE GALERI (PNG)
                  </button>
                  <button 
                    onClick={() => window.print()}
                    className="flex items-center justify-center gap-3 bg-white text-slate-700 border border-slate-200 p-4 rounded-2xl font-bold active:scale-95"
                  >
                    <Printer size={20} />
                    CETAK PDF
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {!selectedStudent && !isAdmin && (
        <div className="fixed bottom-6 left-0 right-0 px-10">
          <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex items-center gap-4">
            <div className="bg-blue-600 text-white p-2 rounded-lg">
              <IdCard size={20} />
            </div>
            <p className="text-[10px] font-bold text-blue-800 leading-snug">
              Kartu digital ini berlaku sebagai bukti sah peserta ujian di lingkungan SMK Canda Bhirawa.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}