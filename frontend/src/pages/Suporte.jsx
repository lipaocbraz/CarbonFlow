import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import styles from './Suporte.module.css'

export default function Suporte() {
  return (
    <>
      <Navbar />
      <div className={styles.page}>
        <div className={styles.container}>

          <div className={styles.leftCol}>
            <div className={styles.photoWrapper}>
              <img
                src="/images/temporario.png"
                alt="Atendente de suporte"
                className={styles.photo}
              />
            </div>

            <div className={styles.divider} />

            <div className={styles.contactBlock}>
              <div className={styles.contactLabel}>E-mail</div>
              <a href="mailto:edenred@gmail.com" className={styles.contactValue}>
                edenred@gmail.com
              </a>
            </div>

            <div className={styles.contactBlock}>
              <div className={styles.contactLabel}>Whatsapp</div>
              <a href="tel:08007707503" className={styles.contactValue}>
                0800-770-7503
              </a>
            </div>
          </div>

          <div className={styles.rightCol}>
            <h2 className={styles.faqTitle}>Dúvidas Frequentes</h2>

            <ul className={styles.faqList}>
              <li>
                <Link to="/" className={styles.faqLink}>
                  Onde ver os Indicadores Gerais.
                </Link>
              </li>
              <li>
                <Link to="/tabela-dados" className={styles.faqLink}>
                  Onde ver os gráficos da empresa cliente.
                </Link>
              </li>
              <li>
                <Link to="/configuracoes" className={styles.faqLink}>
                  Onde há mais opções de acessibilidade.
                </Link>
              </li>
            </ul>

            <p className={styles.tutorialText}>
              Em caso de dúvidas de como utilizar a calculadora,{' '}
              <Link to="/tutorial" className={styles.faqLink}>
                clique aqui.
              </Link>
            </p>
          </div>

        </div>
      </div>
    </>
  )
}
