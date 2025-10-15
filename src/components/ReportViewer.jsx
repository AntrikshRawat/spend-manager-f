// components/ReportViewer.jsx
import ReactMarkdown from "react-markdown";

export default function ReportViewer({ text }) {
  return (
    <div className="max-w-3xl mx-auto bg-white p-4 rounded-md">
      <ReactMarkdown
        children={text}
        components={{
          p: ({ ...props }) => (
            <p className="my-4 leading-7 text-gray-800" {...props} />
          ),
          strong: ({ ...props }) => (
            <strong className="font-semibold text-black my-2" {...props} />
          ),
          h1: ({ ...props }) => (
            <h1 className="text-3xl font-bold text-black mt-6 mb-4 border-b pb-1" {...props} />
          ),
          h2: ({ ...props }) => (
            <h2 className="text-2xl font-bold text-gray-800 mt-5 mb-3" {...props} />
          ),
          li: ({ ...props }) => (
            <li className="ml-6 my-2 list-disc text-gray-700 leading-6" {...props} />
          ),
        }}
      />
    </div>
  );
}
