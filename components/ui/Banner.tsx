type Props = {
  variant: "amber" | "primary";
  children: React.ReactNode;
};

export function Banner({ variant, children }: Props) {
  const styles = {
    amber: "bg-amber-50 border-amber-200 text-amber-800",
    primary: "bg-primary/10 border-primary/20 text-primary",
  };

  return (
    <div className={`${styles[variant]} border-b px-4 py-2 shrink-0 text-center`}>
      <p className="text-xs font-medium">{children}</p>
    </div>
  );
}
