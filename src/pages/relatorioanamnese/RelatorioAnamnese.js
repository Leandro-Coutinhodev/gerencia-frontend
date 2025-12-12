import React, { useState, useEffect } from 'react';
import { Eye, Search } from 'lucide-react';
import AnamnesisService from '../../services/AnamnesisService';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";

// Este componente deve ser integrado ao seu projeto React existente
// Certifique-se de ter useNavigate do react-router-dom disponível

const RelatorioAnamnese = () => {
  const [relatorios, setRelatorios] = useState([]);
  const [filteredRelatorios, setFilteredRelatorios] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const decoded = jwtDecode(token);

  useEffect(() => {
    carregarRelatorios();
  }, []);

  useEffect(() => {
    filtrarRelatorios();
  }, [searchTerm, relatorios]);

  const carregarRelatorios = async () => {
    try {
      setLoading(true);
      const response = await AnamnesisService.listarReferral(decoded.sub);
      setRelatorios(response || []);
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
      setRelatorios([]);
    } finally {
      setLoading(false);
    }
  };

  const filtrarRelatorios = () => {
    if (!searchTerm.trim()) {
      setFilteredRelatorios(relatorios);
      return;
    }

    const termo = searchTerm.toLowerCase();
    const filtered = relatorios.filter(
      (rel) =>
        rel.patientName?.toLowerCase().includes(termo) ||
        rel.assistantName?.toLowerCase().includes(termo) ||
        rel.guardianName?.toLowerCase().includes(termo)
    );
    setFilteredRelatorios(filtered);
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

  return (
    <div className="bg-white rounded-xl shadow p-6">
      {/* Barra de pesquisa */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por paciente, assistente ou responsável..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          />
        </div>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr className="text-left text-gray-600">
              <th className="py-3 px-4 font-medium">Paciente</th>
              <th className="py-3 px-4 font-medium">Assistente</th>
              <th className="py-3 px-4 font-medium">Responsável</th>
              <th className="py-3 px-4 font-medium">Data de Envio</th>
              <th className="py-3 px-4 font-medium text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-6 text-gray-500">
                  Carregando relatórios...
                </td>
              </tr>
            ) : filteredRelatorios.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-6 text-gray-500">
                  {searchTerm ? 'Nenhum relatório encontrado com os filtros aplicados.' : 'Nenhum relatório encontrado.'}
                </td>
              </tr>
            ) : (
              filteredRelatorios.map((relatorio) => (
                <tr
                  key={relatorio.id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="py-3 px-4 font-medium text-gray-900">
                    {relatorio.patientName || '-'}
                  </td>
                  <td className="py-3 px-4 text-gray-700">
                    {relatorio.assistantName || '-'}
                  </td>
                  <td className="py-3 px-4 text-gray-700">
                    {relatorio.guardianName || '-'}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {formatarData(relatorio.sentAt)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex justify-center gap-3">
                      <button
                        className="text-blue-600 hover:text-blue-800 transition p-1 rounded hover:bg-blue-50"
                        title="Visualizar relatório"
                        onClick={() => navigate(`/relatorios/${relatorio.id}`)}
                      >
                        <Eye size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Contador de resultados */}
      {!loading && filteredRelatorios.length > 0 && (
        <div className="mt-4 text-sm text-gray-600 text-right">
          Exibindo {filteredRelatorios.length} relatório{filteredRelatorios.length !== 1 ? 's' : ''}
          {searchTerm && relatorios.length !== filteredRelatorios.length && ` de ${relatorios.length} total`}
        </div>
      )}
    </div>
  );
};

export default RelatorioAnamnese;