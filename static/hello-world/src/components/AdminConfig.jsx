import React, { useEffect, useState } from 'react';
import { invoke, requestJira } from '@forge/bridge';

import LoadingSpinner from '../LoadSpinner';

import ProjectSelector from './ProjectSelector';
import FieldSelector from './FieldSelector';
import '../App.css';
import './component.css';

export default function AdminConfig() {
    const [projects, setProjects] = useState([]);
    const [fields, setFields] = useState([]);

    const [selectedProjects, setSelectedProjects] = useState([]);
    const [selectedFields, setSelectedFields] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState(null); // 'success' | 'error'

    // ─── Load projects, fields, and saved config on mount ───────────────────────
    useEffect(() => {
        async function init() {
            try {
                const [projectsRes, fieldsRes, savedConfig] = await Promise.all([
                    fetchProjects(),
                    fetchFields(),
                    invoke('getConfig'),
                ]);

                setProjects(projectsRes);
                setFields(fieldsRes);

                if (savedConfig) {
                    setSelectedProjects(savedConfig.allowedProjects || []);
                    setSelectedFields(savedConfig.selectedFields || []);
                }
            } catch (err) {
                console.error('Init error:', err);
                setStatus('error');
            } finally {
                setLoading(false);
            }
        }

        init();
    }, []);

    // ─── Fetch all Jira projects ─────────────────────────────────────────────────
    async function fetchProjects() {
        const res = await requestJira('/rest/api/3/project/search?maxResults=50');
        const data = await res.json();
        return (data.values || []).map((p) => ({
            label: p.name,
            value: p.key,
            avatarUrl: p.avatarUrls?.['16x16'],
        }));
    }

    // ─── Fetch all Jira fields ───────────────────────────────────────────────────
    async function fetchFields() {
        const res = await requestJira('/rest/api/3/field');
        const data = await res.json();
        return data
            .filter((f) => !f.id.startsWith('comment'))   // exclude system-only noise
            .map((f) => ({
                label: f.name,
                value: f.id,
                isCustom: f.custom,
                schema: f.schema?.type || '',
            }));
    }

    // ─── Save configuration ──────────────────────────────────────────────────────
    async function handleSave() {
        setSaving(true);
        setStatus(null);
        try {
            await invoke('saveConfig', {
                allowedProjects: selectedProjects,
                selectedFields: selectedFields,
            });
            setStatus('success');
        } catch (err) {
            console.error('Save error:', err);
            setStatus('error');
        } finally {
            setSaving(false);
        }
    }

    // ─── Reset ───────────────────────────────────────────────────────────────────
    function handleReset() {
        setSelectedProjects([]);
        setSelectedFields([]);
        setStatus(null);
    }

    // ─── Render ──────────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <main className="app-frame">
                <LoadingSpinner />
                <p className="field-help">Loading configuration...</p>
            </main>
        );
    }

    return (
        <main className="app-frame">
            <div className="config-content">
                <div style={{ marginTop: '16px' }}>

                    {/* Header */}
                    <div className="config-header">
                        <h1>App Configuration</h1>
                        <p>
                            Select which Jira projects and fields this app should be active on.
                            Changes apply immediately after saving.
                        </p>
                    </div>

                    {/* Status Messages */}
                    {status === 'success' && (
                        <p className="status-message status-success" role="status">
                            <strong>Settings saved</strong> Your configuration has been saved successfully.
                        </p>
                    )}
                    {status === 'error' && (
                        <p className="status-message status-error" role="alert">
                            <strong>Something went wrong</strong> Could not save settings. Please try again.
                        </p>
                    )}

                    {/* Project Selector */}
                    <ProjectSelector
                        projects={projects}
                        selected={selectedProjects}
                        onChange={setSelectedProjects}
                    />

                    {/* Field Selector */}
                    <FieldSelector
                        fields={fields}
                        selected={selectedFields}
                        onChange={setSelectedFields}
                    />

                    {/* Actions */}
                    <div className="action-row">
                        <button
                            className="primary-button"
                            disabled={saving}
                            onClick={handleSave}
                        >
                            {saving ? 'Saving...' : 'Save Configuration'}
                        </button>
                        <button className="secondary-button" onClick={handleReset} disabled={saving}>
                            Reset
                        </button>
                    </div>

                </div>
            </div>
        </main>
    );
}