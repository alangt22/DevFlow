"use client";

import { FiHelpCircle, FiGrid, FiList, FiCheckSquare, FiArrowRight } from "react-icons/fi";

export function RightPanel() {
  return (
    <aside className="w-80 shrink-0">
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white mb-4">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <FiHelpCircle />
          Tutorial Básico
        </h3>
        <div className="space-y-3 text-sm text-blue-100">
          <div className="flex items-start gap-2">
            <FiGrid className="mt-0.5" />
            <p><strong>1. Crie um Board</strong><br/>Comece criando um novo quadro para seu projeto</p>
          </div>
          <div className="flex items-start gap-2">
            <FiList className="mt-0.5" />
            <p><strong>2. Adicione Listas</strong><br/>Crie listas como "A Fazer", "Fazendo", "Feito"</p>
          </div>
          <div className="flex items-start gap-2">
            <FiCheckSquare className="mt-0.5" />
            <p><strong>3. Adicione Cards</strong><br/>Crie tarefas dentro de cada lista</p>
          </div>
          <div className="flex items-start gap-2">
            <FiArrowRight className="mt-0.5" />
            <p><strong>4. Arraste e Solte</strong><br/>Mova cards entre listas para atualizar o progresso</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 shadow border border-gray-200">
        <h3 className="font-semibold text-gray-700 mb-3">Atalhos</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p>• Clique em algum board para ver suas listas e cards</p>
          <p>• Clique em "Adicionar card" para criar tarefa</p>
          <p>• Arraste cards para reordenar</p>
          <p>• Use o botão membros para convidar membros</p>
        </div>
      </div>
    </aside>
  );
}
