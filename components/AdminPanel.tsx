
import React, { useState, useEffect } from 'react';
import * as Lucide from 'lucide-react';
import { getAdminUsers, updateUserStatus, deleteUser } from '../services/api';
import { AdminUser } from '../types';


const chartData = [
  { name: 'Jan', users: 400, premium: 240 },
  { name: 'Fev', users: 300, premium: 139 },
  { name: 'Mar', users: 200, premium: 480 },
  { name: 'Abr', users: 278, premium: 390 },
  { name: 'Mai', users: 189, premium: 480 },
  { name: 'Jun', users: 239, premium: 380 },
  { name: 'Jul', users: 349, premium: 430 },
];

// Custom, dependency-free bar chart component
const SimpleBarChart: React.FC<{ data: any[], bar1Key: string, bar2Key: string, bar1Color: string, bar2Color: string, xAxisKey: string }> = ({ data, bar1Key, bar2Key, bar1Color, bar2Color, xAxisKey }) => {
    const maxValue = Math.max(...data.map(d => Math.max(d[bar1Key], d[bar2Key])));
    return (
        <div className="w-full h-full flex flex-col justify-end">
            <div className="flex justify-between items-end h-full px-2" style={{borderLeft: '1px solid #4a4a4a', borderBottom: '1px solid #4a4a4a'}}>
                {data.map((item: any, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                         <div className="flex items-end h-full" style={{width: '70%'}}>
                            <div style={{ height: `${(item[bar1Key] / maxValue) * 100}%`, backgroundColor: bar1Color }} className="w-1/2 rounded-t-sm transition-opacity duration-200 group-hover:opacity-75"></div>
                            <div style={{ height: `${(item[bar2Key] / maxValue) * 100}%`, backgroundColor: bar2Color }} className="w-1/2 rounded-t-sm ml-0.5 transition-opacity duration-200 group-hover:opacity-75"></div>
                        </div>
                        <div className="absolute -top-8 hidden group-hover:block bg-gray-900 text-xs p-1 rounded shadow-lg border border-gray-600">
                           <div>Total: {item[bar1Key]}</div>
                           <div>Premium: {item[bar2Key]}</div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex justify-between text-xs text-gray-400 px-2 mt-1">
                 {data.map((item: any, index) => (
                    <span key={index} className="flex-1 text-center">{item[xAxisKey]}</span>
                ))}
            </div>
        </div>
    );
};

// Custom, dependency-free line chart placeholder
const SimpleLineChartPlaceholder: React.FC = () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-700/30 rounded-md border border-dashed border-gray-600">
        <div className="text-center text-gray-500">
            <Lucide.BarChart2 size={32} className="mx-auto mb-2" />
            <p className="font-semibold">Gráfico de Linhas</p>
            <p className="text-xs">Moedas Mais Analisadas</p>
        </div>
    </div>
);


const AdminPanel: React.FC = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    
    const tabLabels: { [key: string]: string } = {
        dashboard: 'Painel',
        users: 'Usuários',
        plans: 'Planos',
        backend: 'Backend & Instalação'
    };

    const renderContent = () => {
        switch(activeTab) {
            case 'dashboard': return <AdminDashboard />;
            case 'users': return <UserManagement />;
            case 'plans': return <PlanManagement />;
            case 'backend': return <BackendInstructions />;
            default: return <AdminDashboard />;
        }
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-white">Painel Administrativo</h1>
            <div className="flex border-b border-gray-700 overflow-x-auto">
                {Object.keys(tabLabels).map(tab => (
                     <button 
                        key={tab} 
                        onClick={() => setActiveTab(tab)}
                        className={`py-2 px-4 font-medium whitespace-nowrap ${activeTab === tab ? 'border-b-2 border-primary text-primary' : 'text-gray-400'}`}>
                         {tabLabels[tab]}
                     </button>
                ))}
            </div>
            <div>{renderContent()}</div>
        </div>
    );
};

const AdminDashboard: React.FC = () => (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard icon={<Lucide.Users />} title="Total de Usuários" value="12,345" change="+5.2%" />
            <StatCard icon={<Lucide.UserCheck />} title="Usuários Premium" value="1,876" change="+12.1%" />
            <StatCard icon={<Lucide.BarChart2 />} title="Análises/Dia" value="5,678" change="-1.8%" />
            <StatCard icon={<Lucide.DollarSign />} title="Receita de Vendas" value="R$ 93.612,40" change="+8.9%" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 h-80 flex flex-col">
                <h3 className="font-bold mb-4">Novos Usuários x Premium</h3>
                <div className="flex-grow">
                    <SimpleBarChart 
                        data={chartData} 
                        bar1Key="users" 
                        bar2Key="premium" 
                        bar1Color="#007BFF" 
                        bar2Color="#28a745" 
                        xAxisKey="name"
                    />
                </div>
                 <div className="flex justify-center mt-2 text-xs">
                    <div className="flex items-center mr-4"><div className="w-3 h-3 bg-[#007BFF] mr-1 rounded-sm"></div> Total</div>
                    <div className="flex items-center"><div className="w-3 h-3 bg-[#28a745] mr-1 rounded-sm"></div> Premium</div>
                </div>
            </div>
             <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 h-80">
                <h3 className="font-bold mb-4">Moedas Mais Analisadas</h3>
                 <div className="h-full pb-8">
                     <SimpleLineChartPlaceholder />
                 </div>
            </div>
        </div>
    </div>
);

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchUsers = async () => {
        try {
            const data = await getAdminUsers();
            setUsers(data);
        } catch (error) {
            console.error("Failed to fetch admin users:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleToggleStatus = async (id: string, currentStatus: 'Ativo' | 'Suspenso') => {
        const newStatus = currentStatus === 'Ativo' ? 'Suspenso' : 'Ativo';
        setActionLoading(id);
        try {
            await updateUserStatus(id, newStatus);
            // Atualização otimista da UI
            setUsers(users.map(u => u.id === id ? { ...u, status: newStatus } : u));
        } catch (error) {
            console.error("Failed to update status", error);
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Tem certeza que deseja excluir este usuário?")) return;
        
        setActionLoading(id);
        try {
            await deleteUser(id);
            setUsers(users.filter(u => u.id !== id));
        } catch (error) {
            console.error("Failed to delete user", error);
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <h2 className="text-xl font-bold mb-4">Gerenciamento de Usuários</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-300">
                    <thead className="text-xs text-gray-400 uppercase bg-gray-700">
                        <tr>
                            <th className="px-4 py-3">Nome</th>
                            <th className="px-4 py-3">Email</th>
                            <th className="px-4 py-3">Plano</th>
                            <th className="px-4 py-3">Cadastro</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="text-center p-8">
                                    <Lucide.Loader className="animate-spin h-8 w-8 mx-auto text-gray-500" />
                                </td>
                            </tr>
                        ) : (
                            users.map(user => (
                                <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                    <td className="px-4 py-2 font-medium text-white">{user.name}</td>
                                    <td className="px-4 py-2">{user.email}</td>
                                    <td className="px-4 py-2">
                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${user.plan === 'Premium' ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-600/20 text-gray-400'}`}>
                                            {user.plan}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 text-gray-400 text-xs">{user.joinedAt || 'N/A'}</td>
                                    <td className="px-4 py-2"><span className={`px-2 py-1 rounded-full text-xs font-bold ${user.status === 'Ativo' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{user.status}</span></td>
                                    <td className="px-4 py-2 flex gap-2">
                                        {actionLoading === user.id ? (
                                            <Lucide.Loader className="animate-spin h-5 w-5 text-gray-400" />
                                        ) : (
                                            <>
                                                <button className="p-1 text-gray-400 hover:text-primary transition-colors" title="Editar"><Lucide.Edit size={16} /></button>
                                                
                                                <button 
                                                    onClick={() => handleToggleStatus(user.id, user.status)}
                                                    className={`p-1 transition-colors ${user.status === 'Ativo' ? 'text-gray-400 hover:text-yellow-400' : 'text-green-500 hover:text-green-400'}`} 
                                                    title={user.status === 'Ativo' ? 'Suspender' : 'Ativar'}
                                                >
                                                    {user.status === 'Ativo' ? <Lucide.Ban size={16} /> : <Lucide.CheckCircle size={16} />}
                                                </button>
                                                
                                                <button 
                                                    onClick={() => handleDelete(user.id)}
                                                    className="p-1 text-gray-400 hover:text-danger transition-colors" 
                                                    title="Excluir"
                                                >
                                                    <Lucide.Trash size={16} />
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                        {!loading && users.length === 0 && (
                            <tr>
                                <td colSpan={6} className="text-center p-4 text-gray-500">Nenhum usuário encontrado.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}


const PlanManagement: React.FC = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <h2 className="text-xl font-bold mb-4">Gerenciar Planos</h2>
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <p>Preço Plano Premium (Vitalício):</p>
                    <div className="flex items-center gap-2">
                        <input type="text" defaultValue="99.90" className="w-24 bg-gray-700 border border-gray-600 rounded-md p-1 text-right text-white" />
                        <button className="bg-primary hover:bg-primary-hover text-white px-3 py-1 rounded-md text-sm transition-colors">Salvar</button>
                    </div>
                </div>
            </div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <h2 className="text-xl font-bold mb-4">Ações Rápidas</h2>
            <div className="space-y-3">
                <button className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"><Lucide.MessageSquare size={16}/> Enviar Comunicado</button>
                <button className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"><Lucide.Tag size={16}/> Criar Cupom de Desconto</button>
            </div>
        </div>
    </div>
);

const BackendInstructions: React.FC = () => (
    <div className="space-y-6">
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Lucide.Server size={24} className="text-primary"/> Status do Backend</h2>
            <div className="p-4 bg-red-900/20 border border-red-900/50 rounded text-red-200 flex items-center gap-3">
                <Lucide.AlertCircle size={24} />
                <div>
                    <p className="font-bold">Servidor Local Não Detectado</p>
                    <p className="text-sm">O frontend está rodando em modo de simulação. Para usar o backend real, você precisa rodar o servidor Node.js.</p>
                </div>
            </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h2 className="text-xl font-bold mb-4">Como instalar o Backend</h2>
            <div className="space-y-4 text-gray-300 text-sm">
                <p>1. Baixe os arquivos gerados na pasta <code className="bg-gray-900 p-1 rounded">server/</code> e <code className="bg-gray-900 p-1 rounded">database/</code>.</p>
                <p>2. Instale o Node.js em seu computador ou servidor.</p>
                <p>3. Instale as dependências do projeto:</p>
                <pre className="bg-gray-900 p-3 rounded text-green-400 overflow-x-auto">
                    npm install express cors dotenv @supabase/supabase-js @google/genai multer
                </pre>
                <p>4. Crie um projeto no <strong>Supabase</strong> e rode o script SQL contido em <code className="bg-gray-900 p-1 rounded">database/schema.sql</code>.</p>
                <p>5. Configure o arquivo <code className="bg-gray-900 p-1 rounded">.env</code> com suas chaves de API (Supabase e Google Gemini).</p>
                <p>6. Inicie o servidor:</p>
                <pre className="bg-gray-900 p-3 rounded text-green-400 overflow-x-auto">
                    node server.js
                </pre>
            </div>
        </div>
    </div>
);

const StatCard: React.FC<{ icon: React.ReactNode, title: string, value: string, change: string }> = ({ icon, title, value, change }) => (
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/20 rounded-full text-primary">{icon}</div>
            <div>
                <p className="text-sm text-gray-400">{title}</p>
                <p className="text-2xl font-bold">{value}</p>
                <p className={`text-xs ${change.startsWith('+') ? 'text-success' : 'text-danger'}`}>{change}</p>
            </div>
        </div>
    </div>
);

export default AdminPanel;
