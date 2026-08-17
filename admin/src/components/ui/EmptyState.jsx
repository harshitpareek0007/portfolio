import { Card } from "./Card";

export const EmptyState = ({ title, description }) => {
    return (
        <Card className="flex flex-col items-center justify-center p-12 text-center h-full">
            <h3 className="text-lg font-medium text-text mb-2">{title}</h3>
            <p className="text-muted">{description}</p>
        </Card>
    );
};
