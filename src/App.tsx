import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Dashboard } from './components/Dashboard';
import { Header } from './components/Header';
import { NavTabs, type Tab } from './components/NavTabs';
import { PredictionResultView } from './components/PredictionResultView';
import { SettingsPanel } from './components/SettingsPanel';
import { StudentForm } from './components/StudentForm';
import { StudentsList } from './components/StudentsList';
import { predictPerformance } from './lib/predictor';
import {
  exportStudents,
  generateId,
  importStudents,
  loadSettings,
  loadStudents,
  saveSettings,
  saveStudents,
  type StoredStudent,
} from './lib/storage';
import { DEFAULT_STUDENT, type InstitutionSettings, type StudentInput } from './types';

function App() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [students, setStudents] = useState<StoredStudent[]>([]);
  const [settings, setSettings] = useState<InstitutionSettings>(loadSettings());
  const [formData, setFormData] = useState<Omit<StudentInput, 'id' | 'createdAt'>>({
    ...DEFAULT_STUDENT,
    institutionType: loadSettings().type,
  });
  const [lastResult, setLastResult] = useState<{
    student: StudentInput;
    prediction: StoredStudent['prediction'];
  } | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setStudents(loadStudents());
  }, []);

  const persistStudents = useCallback((updated: StoredStudent[]) => {
    setStudents(updated);
    saveStudents(updated);
  }, []);

  const runPrediction = useCallback(
    (save: boolean) => {
      const student: StudentInput = {
        ...formData,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };
      const prediction = predictPerformance(student);
      setLastResult({ student, prediction });

      if (save) {
        const stored: StoredStudent = { ...student, prediction };
        persistStudents([...students, stored]);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    },
    [formData, students, persistStudents],
  );

  const handleDelete = (id: string) => {
    persistStudents(students.filter((s) => s.id !== id));
  };

  const handleImport = async (file: File) => {
    try {
      const imported = await importStudents(file);
      persistStudents([...students, ...imported]);
    } catch {
      alert('Failed to import file. Please use a valid EduPredict JSON export.');
    }
  };

  const handleSaveSettings = () => {
    saveSettings(settings);
    setFormData((prev) => ({ ...prev, institutionType: settings.type }));
  };

  return (
    <div className="min-h-screen bg-surface-900">
      <div className="fixed inset-0 bg-mesh pointer-events-none" />
      <div className="fixed top-20 left-10 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl pointer-events-none animate-float" />
      <div className="fixed bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none animate-float" style={{ animationDelay: '3s' }} />

      <Header institutionName={settings.name} />

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <NavTabs active={tab} onChange={setTab} studentCount={students.length} />

        <AnimatePresence mode="wait">
          {tab === 'dashboard' && (
            <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Dashboard students={students} />
            </motion.div>
          )}

          {tab === 'predict' && (
            <motion.div key="predict" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <StudentForm
                data={formData}
                onChange={setFormData}
                onPredict={() => runPrediction(false)}
                onSave={() => runPrediction(true)}
                onReset={() => setFormData({ ...DEFAULT_STUDENT, institutionType: settings.type })}
              />
              {lastResult && (
                <div className="mt-8">
                  <PredictionResultView student={lastResult.student} result={lastResult.prediction} />
                </div>
              )}
              {saved && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="fixed bottom-6 right-6 px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-sm"
                >
                  Student saved successfully!
                </motion.div>
              )}
            </motion.div>
          )}

          {tab === 'students' && (
            <motion.div key="students" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <StudentsList
                students={students}
                onDelete={handleDelete}
                onExport={() => exportStudents(students)}
                onImport={handleImport}
              />
            </motion.div>
          )}

          {tab === 'settings' && (
            <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <SettingsPanel settings={settings} onChange={setSettings} onSave={handleSaveSettings} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="relative border-t border-white/5 mt-16 py-6 text-center text-xs text-gray-600">
        EduPredict · Student Performance Prediction System · Built for Schools & Colleges
      </footer>
    </div>
  );
}

export default App;
