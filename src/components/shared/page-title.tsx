export function PageTitle({ title }: { title: string }) {
  const text = title.split(" - ")[0];
  return <div className="fixed left-1/2 -translate-x-1/2 top-4 z-40 px-10 2xs:px-3 py-1 text-sm font-medium text-gray-500 text-center">{text}</div>
}