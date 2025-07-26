import React from 'react';
import { Layout } from 'antd';
import { HeartOutlined } from '@ant-design/icons';

const { Footer: AntFooter } = Layout;

const Footer = () => {
    return (
        <AntFooter style={styles.footer}>
            <div style={styles.footerContent}>
                <p style={styles.copyright}>
                    &copy; 2025 طُوّر بـ <HeartOutlined style={styles.heartIcon} /> بواسطة يسرى الزوق. جميع الحقوق محفوظة.
                </p>
            </div>
        </AntFooter>
    );
};

const styles = {
    footer: {
        background: 'linear-gradient(135deg, #0f172a, #1e3a8a)', // Dégradé de fond
        color: 'white',
        textAlign: 'center',
        padding: '20px 0',
        position: 'relative',
        bottom: 0,
        width: '100%',
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
