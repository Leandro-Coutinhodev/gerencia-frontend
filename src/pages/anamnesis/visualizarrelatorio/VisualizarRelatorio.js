import React, { useState, useEffect } from 'react';
import { ArrowLeft, FileText, User, Calendar, Loader, Download, Eye } from 'lucide-react';
import AnamnesisService from '../../../services/AnamnesisService';
import { useNavigate, useParams } from 'react-router-dom';

const VisualizarRelatorio = () => {
  const [relatorio, setRelatorio] = useState(null);
  const [selectedFields, setSelectedFields] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { referralId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    carregarRelatorio();
  }, [referralId]);

  const carregarRelatorio = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await AnamnesisService.relReferral(referralId);
      setRelatorio(response);
      
      if (response?.selectedFieldsJson) {
        try {
          const parsed = JSON.parse(response.selectedFieldsJson);
          setSelectedFields(parsed);
        } catch (parseError) {
          console.error('Erro ao fazer parse do JSON:', parseError);
          setSelectedFields({});
        }
      }
    } catch (error) {
      console.error('Erro ao carregar relatório:', error);
      setError('Não foi possível carregar o relatório. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (date) => {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatarDataNascimento = (date) => {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR');
  };

  const visualizarLaudo = () => {
    const anamnesisId = relatorio?.anamnesis?.id;
    if (anamnesisId) {
      const url = `http://72.62.12.212:8080/api-gateway/gerencia/anamnesis/${anamnesisId}/report`;
      window.open(url, '_blank');
    }
  };

  const fieldLabels = {
    diagnoses: 'Diagnósticos',
    medicationAndAllergies: 'Medicações e Alergias',
    indications: 'Indicações',
    objectives: 'Por qual motivo nos procurou? (Objetivos)',
    developmentHistory: 'Gestação - Diagnóstico - Processo de Desenvolvimento - Dias Atuais',
    preferences: 'Preferências do aluno (a)',
    interferingBehaviors: 'O que gera comportamentos interferentes? Qual o Plano de Conduta?',
    qualityOfLife: 'Tem algo que comprometa a qualidade de vida do aluno? E da família?',
    feeding: 'Como é a Alimentação? (Seletividade - Compulsividade - Acompanhamento Nutricional)',
    sleep: 'Como é a rotina do Sono? Agitação - Contínuo',
    therapists: 'Equipe de Terapeutas:'
  };

  const renderField = (key, value) => {
    if (!value || value.trim() === '') return null;

    return (
      <div key={key} className="bg-gray-50 rounded-lg p-5 border border-gray-200 hover:border-gray-300 transition">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <FileText size={16} className="text-[#3D75C4]" />
          {fieldLabels[key] || key}
        </h3>
        <p className="text-gray-800 whitespace-pre-wrap leading-relaxed text-sm">
          {value}
        </p>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center bg-white rounded-xl shadow-sm p-8">
          <Loader className="animate-spin mx-auto mb-4 text-[#3D75C4]" size={48} />
          <p className="text-gray-600 font-medium">Carregando relatório...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-[#3D75C4] mb-6 transition font-medium"
          >
            <ArrowLeft size={20} />
            Voltar
          </button>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center shadow-sm">
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!relatorio) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-[#3D75C4] mb-6 transition font-medium"
          >
            <ArrowLeft size={20} />
            Voltar
          </button>
          <div className="bg-white rounded-lg p-6 text-center shadow-sm">
            <p className="text-gray-600">Relatório não encontrado.</p>
          </div>
        </div>
      </div>
    );
  }

  const camposPreenchidos = Object.keys(selectedFields).filter(
    key => selectedFields[key] && selectedFields[key].trim() !== ''
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Botão Voltar */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-[#3D75C4] mb-6 transition font-medium"
        >
          <ArrowLeft size={20} />
          Voltar
        </button>

        {/* Cabeçalho do Relatório */}
        <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8 mb-6">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Relatório de Anamnese
              </h1>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <span>Encaminhamento #{relatorio.id}</span>
                <span>•</span>
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  {formatarData(relatorio.sentAt)}
                </div>
              </div>
            </div>
            <button
              onClick={visualizarLaudo}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#3D75C4] text-white rounded-lg hover:bg-[#2d5ea3] transition font-medium shadow-sm"
            >
              <Eye size={18} />
              <span>Visualizar Laudo</span>
            </button>
          </div>

          {/* Informações Principais */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
            {/* Paciente */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-2 font-medium uppercase">
                Paciente
              </p>
              <p className="font-semibold text-gray-900 flex items-center gap-2">
                <User size={18} className="text-[#3D75C4]" />
                {relatorio.anamnesis.patient.name || '-'}
              </p>
            </div>

            {/* Assistente */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-2 font-medium uppercase">
                Assistente Responsável
              </p>
              <p className="font-semibold text-gray-900">
                {relatorio.assistant.name || '-'}
              </p>
            </div>
          </div>
        </div>

        {/* Campos Selecionados */}
        <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
              Informações do Relatório
            </h2>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
              {camposPreenchidos.length} {camposPreenchidos.length === 1 ? 'campo' : 'campos'}
            </span>
          </div>

          {camposPreenchidos.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              <FileText size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 font-medium">
                Nenhum campo foi preenchido neste relatório.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.keys(fieldLabels).map(key => 
                renderField(key, selectedFields[key])
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisualizarRelatorio;