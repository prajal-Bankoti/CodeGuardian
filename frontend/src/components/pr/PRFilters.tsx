import React from 'react';
import Select from '../common/Select';

interface PRFiltersProps {
    selectedRepo: string;
    selectedStatus: string;
    repositories: string[];
    onRepoChange: (repo: string) => void;
    onStatusChange: (status: string) => void;
}

const PRFilters: React.FC<PRFiltersProps> = ({
    selectedRepo,
    selectedStatus,
    repositories,
    onRepoChange,
    onStatusChange,
}) => {
    const repositoryOptions = repositories.map(repo => ({
        value: repo,
        label: repo.split('/').pop() || repo // Show just the repository name, not the full path
    }));

    const statusOptions = [
        { value: 'open', label: 'Open' },
        { value: 'merged', label: 'Merged' },
        { value: 'declined', label: 'Declined' },
    ];

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <Select
                            label="Repository"
                            options={repositoryOptions}
                            value={selectedRepo}
                            onChange={(e) => onRepoChange(e.target.value)}
                            className="min-w-[200px]"
                        />
                    </div>

                    <div className="flex-1">
                        <Select
                            label="Status"
                            options={statusOptions}
                            value={selectedStatus}
                            onChange={(e) => onStatusChange(e.target.value)}
                            className="min-w-[150px]"
                        />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default PRFilters;
