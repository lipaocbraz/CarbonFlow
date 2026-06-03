import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import styles from './Tutorial.module.css'

const SECOES = [
  {
    titulo: 'Home',
    link: '/',
    descricao:
      'Na tela inicial, tem os resultados de forma resumida, que clicando há como acessar os resultados de forma completa.',
  },
  {
    titulo: 'Resultados',
    link: '/tabela-dados',
    descricao:
      'Em resultados, há os indicadores gerais da calculadora, gráficos para representações visuais e no final da tela tem como exportar um relatório em formato planilha ou PDF.',
  },
  {
    titulo: 'Suporte',
    link: '/suporte',
    descricao:
      'Nesta tela, além de tirar dúvidas que frequentemente aparecem e vir para o tutorial, tem os dois meios de contato com a Edenred (e-mail e whatsapp).',
  },
  {
    titulo: 'Configurações',
    link: '/configuracoes',
    descricao:
      'Em configurações, há os dados da empresa cliente que são manualmente editáveis, dados relacionados aos fatores de emissão, os usuários e as permissões da calculadora.',
  },
  {
    titulo: 'Acessibilidade',
    link: '/configuracoes',
    descricao:
      'Na acessibilidade tem como configurar o modo escuro do programa, o tamanho da fonte, mudar a tipografia para usuários disléxicos e a língua, que tem: português, inglês, alemão e espanhol.',
  },
]

export default function Tutorial() {
  return (
    <>
      <Navbar />
      <div className={styles.page}>
        <h1 className={styles.titulo}>Tutorial</h1>

        {SECOES.map(s => (
          <div key={s.titulo} className={styles.secao}>
            <Link to={s.link} className={styles.secaoLink}>
              {s.titulo}
            </Link>
            <p className={styles.secaoDesc}>{s.descricao}</p>
          </div>
        ))}
      </div>
    </>
  )
}
