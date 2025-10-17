import React from 'react';
import Select from '../common/Select';
import Button from '../common/Button';

interface PRFiltersProps {
    selectedRepo: string;
    selectedStatus: string;
    repositories: string[];
    selectedCount: number;
    totalCount: number;
    onRepoChange: (repo: string) => void;
    onStatusChange: (status: string) => void;
    onSelectAll: () => void;
    onAIReview: () => void;
}

const PRFilters: React.FC<PRFiltersProps> = ({
    selectedRepo,
    selectedStatus,
    repositories,
    selectedCount,
    totalCount,
    onRepoChange,
    onStatusChange,
    onSelectAll,
    onAIReview,
}) => {
    const repositoryOptions = repositories.map(repo => ({
        value: repo,
        label: repo === 'all' ? 'All Repositories' : repo
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

                <div className="flex items-center space-x-4">
                    <div className="bg-gray-50 rounded-lg px-4 py-2">
                        <div className="text-sm text-gray-600">
                            <span className="font-medium text-gray-900">{selectedCount}</span> of <span className="font-medium text-gray-900">{totalCount}</span> selected
                        </div>
                    </div>
                    <Button
                        variant="secondary"
                        onClick={onSelectAll}
                        className="transition-all duration-200 hover:scale-105"
                    >
                        {selectedCount === totalCount ? 'Deselect All' : 'Select All'}
                    </Button>
                    <Button
                        variant="primary"
                        onClick={onAIReview}
                        disabled={selectedCount === 0}
                        className="transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        AI Review Selected
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default PRFilters;
