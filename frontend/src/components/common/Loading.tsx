export const Loading = ({ label = 'Loading...' }: { label?: string }) => (
  <div className="flex items-center justify-center p-8 text-sm text-gray-500">{label}</div>
);
