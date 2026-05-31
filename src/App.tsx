import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { Header } from './components/Header';
import { NavTabs, type Tab } from './components/NavTabs';
import { PredictionResultView } from './components/PredictionResultView';
import { SettingsPanel } from './components/SettingsPanel';
import { StudentForm } from './components/StudentForm';
import { StudentsList } from './components/StudentsList';
import { ValidationPanel } from './components/ValidationPanel';
import { parseStudentsCsv } from './lib/csvImport';
import { loadModel } from './lib/modelLoader';
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
import type { ModelData } from './types/model';
import { DEFAULT_STUDENT, type InstitutionSettings, type StudentInput } from './types';

function App() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [students, setStudents] = useState<StoredStudent[]>([]);
  const [settings, setSettings] = useState<InstitutionSettings>(loadSettings());
  const [model, setModel] = useState<ModelData | null>(null);
  const [modelError, setModelError] = useState<string | null>(null);
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
    loadModel()
      .then(setModel)
      .catch(() => setModelError('Could not load validated prediction model. Run: python scripts/train_model.py'));
  }, []);

  const persistStudents = useCallback((updated: StoredStudent[]) => {
    setStudents(updated);
    saveStudents(updated);
  }, []);

  const runPrediction = useCallback(
    (save: boolean) => {
      if (!model) return;
      const student: StudentInput = {
        ...formData,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };
      const prediction = predictPerformance(student, model, settings);
      setLastResult({ student, prediction });

      if (save) {
        const stored: StoredStudent = { ...student, prediction };
        persistStudents([...students, stored]);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    },
    [formData, students, persistStudents, model, settings],
  );

  const handleDelete = (id: string) => {
    persistStudents(students.filter((s) => s.id !== id));
  };

  const handleImportJson = async (file: File) => {
    try {
      const imported = await importStudents(file);
      persistStudents([...students, ...imported]);
    } catch {
      alert('Failed to import file. Please use a valid EduPredict JSON export.');
    }
  };

  const handleImportCsv = async (file: File) => {
    if (!model) return;
    try {
      const text = await file.text();
      const imported = parseStudentsCsv(text, model, settings);
      persistStudents([...students, ...imported]);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to import CSV');
    }
  };

  const handleSaveSettings = () => {
    saveSettings(settings);
    setFormData((prev) => ({ ...prev, institutionType: settings.type }));
  };

  if (modelError) {
    return (
      <div className="min-h-screen bg-surface-900 flex items-center justify-center p-8">
        <div className="glass-card max-w-md text-center">
          <p className="text-red-400 mb-2">Model Load Error</p>
          <p className="text-gray-400 text-sm">{modelError}</p>
        </div>
      </div>
    );
  }

  if (!model) {
    return (
      <div className="min-h-screen bg-surface-900 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin text-brand-400" />
          Loading validated prediction model...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-900">
      <div className="fixed inset-0 bg-mesh pointer-events-none" />
      <div className="fixed top-20 left-10 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl pointer-events-none animate-float" />
      <div className="fixed bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none animate-float" style={{ animationDelay: '3s' }} />

      <Header institutionName={settings.name} modelVersion={model.version} />

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
                onImportJson={handleImportJson}
                onImportCsv={handleImportCsv}
              />
            </motion.div>
          )}

          {tab === 'validation' && (
            <motion.div key="validation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ValidationPanel model={model} />
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
        EduPredict v{model.version} · Validated on UCI Student Performance Dataset · Built for Schools & Colleges
      </footer>
    </div>
  );
}

export default App;
