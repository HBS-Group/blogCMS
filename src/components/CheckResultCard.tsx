interface CheckResultCardProps {
    title: string;
    status: 'good' | 'warning' | 'bad' | 'info' | 'not_applicable';
    details: React.ReactNode; // Allow passing JSX for details
    recommendation?: string;
}

const statusClasses = {
    good: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
    warning: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
    bad: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' },
    info: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
    not_applicable: { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-300' },
};

export default function CheckResultCard({ title, status, details, recommendation }: CheckResultCardProps) {
    const classes = statusClasses[status] || statusClasses.info;

    return (
        <div className={`p-4 rounded-md border ${classes.border} ${classes.bg} mb-4`}>
            <h3 className={`text-lg font-semibold ${classes.text} mb-2 flex items-center`}>
                {/* Optional: Add an icon based on status */}
                {title}
                <span className={`ml-2 text-xs font-bold uppercase px-2 py-0.5 rounded-full ${classes.bg === 'bg-gray-100' ? 'bg-gray-200' : classes.bg.replace('-100', '-200')} ${classes.text}`}>
                     {status.replace('_', ' ')}
                </span>
            </h3>
            <div className={`text-sm ${classes.text} space-y-1`}>{details}</div>
            {recommendation && <p className="mt-2 text-xs text-gray-600 italic">Recommendation: {recommendation}</p>}
        </div>
    );
}