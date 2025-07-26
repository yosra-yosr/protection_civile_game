import React from 'react';
import { Layout } from 'antd';
import { HeartOutlined } from '@ant-design/icons';

const { Footer: AntFooter } = Layout;

const Footer = () => {
    return (
        <AntFooter style={styles.footer}>
            <div style={styles.footerContent}>
                <p style={styles.copyright}>
                    &copy; 2025 طُوّر بـ <HeartOutlined style={styles.heartIcon} /> بواسطة المتطوعة يسرى الزوق في خدمة الحماية المدنية ببن عروس. جميع الحقوق محفوظة.
                </p>
            </div>
        </AntFooter>
    );
};

const styles = {
    footer: {
        position: 'fixed', // Fixe le footer
        bottom: 0,        // Positionné en bas
        left: 0,          // Aligné à gauche
        right: 0,         // Aligné à droite
        background: 'linear-gradient(135deg, #0f172a, #1e3a8a)', // Dégradé de fond
        color: 'white',
        textAlign: 'center',
        padding: '20px 0',
        zIndex: 1000,     // Assurez-vous qu'il est au-dessus des autres éléments
    },
    footerContent: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px',
    },
    copyright: {
        fontSize: '1rem',
        margin: 0,
        fontWeight: 'bold',
        textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)', // Ombre pour le texte
    },
    heartIcon: {
        color: '#dc2626', // Couleur de l'icône
    },
};

export default Footer;
