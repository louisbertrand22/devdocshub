import "./PageWrapper.css";

interface PageWrapperProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PageWrapper({
  title,
  description,
  children,
  actions,
  className = "",
}: PageWrapperProps) {
  return (
    <div className={`page-wrapper ${className}`}>
      {/* En-tête de page */}
      <div className="page-wrapper__header">
        <div className="page-wrapper__header-content">
          <div className="page-wrapper__title-section">
            <h1 className="page-wrapper__title">{title}</h1>
            {description && (
              <p className="page-wrapper__description">{description}</p>
            )}
          </div>
          {actions && (
            <div className="page-wrapper__actions">{actions}</div>
          )}
        </div>
      </div>

      {/* Contenu principal */}
      <div className="page-wrapper__content">
        {children}
      </div>
    </div>
  );
}