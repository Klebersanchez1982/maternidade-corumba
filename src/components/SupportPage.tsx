import { Mail, Phone, MessageCircle, Code } from 'lucide-react';

export default function SupportPage() {
  return (
    <div className="flex flex-col h-full px-4 pt-6 pb-4">
      <div className="max-w-sm mx-auto w-full">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <Code className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-base font-semibold text-foreground">Suporte Técnico</h2>
          <p className="text-xs text-muted-foreground mt-1">Desenvolvedor responsável pelo sistema</p>
        </div>

        <div className="bg-card rounded-xl shadow-card p-4 space-y-4">
          <div>
            <p className="text-sm font-semibold text-foreground">Kleber Sanchez</p>
            <p className="text-xs text-muted-foreground">Desenvolvedor</p>
          </div>

          <div className="space-y-3">
            <a
              href="mailto:kleber@sanchez.eti.br"
              className="flex items-center gap-3 py-2 px-3 rounded-lg bg-muted hover:bg-accent transition-colors"
            >
              <Mail className="h-4 w-4 text-primary shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">E-mail</p>
                <p className="text-sm text-foreground">kleber@sanchez.eti.br</p>
              </div>
            </a>

            <a
              href="tel:+5516994136309"
              className="flex items-center gap-3 py-2 px-3 rounded-lg bg-muted hover:bg-accent transition-colors"
            >
              <Phone className="h-4 w-4 text-primary shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Telefone</p>
                <p className="text-sm text-foreground">(16) 99413-6309</p>
              </div>
            </a>

            <a
              href="https://wa.me/5516994136309"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 py-2 px-3 rounded-lg bg-success/10 hover:bg-success/20 transition-colors"
            >
              <MessageCircle className="h-4 w-4 text-success shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">WhatsApp</p>
                <p className="text-sm text-foreground">(16) 99413-6309</p>
              </div>
            </a>
          </div>
        </div>

        <p className="text-[10px] text-muted-foreground/60 text-center mt-6">
          Farmácia Maternidade · Sistema de Controle de Medicamentos
        </p>
      </div>
    </div>
  );
}
