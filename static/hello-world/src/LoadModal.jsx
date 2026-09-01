import React from 'react';
import { Modal } from '@forge/bridge';
import './App.css';


export default async function LoadModal({ data }) {
    const modal = new Modal({
        resource: 'modal',
        onClose: (payload) => {
            console.log('onClose called with', payload);
        },
        size: 'medium',
        context: {
            name: data.Name,
            email: data.Email,
            region: data["Region Affiliation"]
        },
        title: 'My Modal'
    });
    await modal.open();
};

