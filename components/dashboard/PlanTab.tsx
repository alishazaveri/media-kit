"use client";

export function PlanTab() {
  return (
    <div className="h-full overflow-y-auto px-4 lg:px-6 py-5 pb-24 lg:pb-5">
      <div className="max-w-2xl mx-auto space-y-5">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Plans &amp; billing</h2>
          <p className="text-sm text-gray-500 mt-1">
            You&apos;re currently on the{" "}
            <strong className="text-primary font-semibold">Creator Pro</strong> plan.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-3">
            <div>
              <p className="font-bold text-gray-900 text-base">Monthly</p>
              <p className="text-3xl font-black text-gray-900 mt-1">
                $9<span className="text-base font-normal text-gray-400"> /mo</span>
              </p>
              <p className="text-sm text-gray-400 mt-0.5">Flexible billing</p>
            </div>
            <button className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-2.5 rounded-xl transition-colors text-sm">
              Switch
            </button>
          </div>

          <div className="bg-purple-50 rounded-2xl border-2 border-purple-300 p-5 flex flex-col gap-3 relative">
            <span className="absolute top-4 right-4 bg-purple-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              Current
            </span>
            <div>
              <p className="font-bold text-gray-900 text-base">Annual</p>
              <p className="text-3xl font-black text-gray-900 mt-1">
                $79<span className="text-base font-normal text-gray-400"> /year</span>
              </p>
              <p className="text-sm text-gray-400 mt-0.5">Save 27%</p>
            </div>
            <button
              disabled
              className="w-full bg-white text-gray-400 font-semibold py-2.5 rounded-xl text-sm cursor-default border border-gray-200"
            >
              Active plan
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="font-bold text-gray-900 text-base mb-0.5">Payment method</p>
          <p className="text-sm text-gray-400 mb-4">Update your card or billing email</p>
          <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-blue-700 text-white text-xs font-extrabold px-2 py-1 rounded-md tracking-wider">
                VISA
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">•••• 4242</p>
                <p className="text-xs text-gray-400">Expires 04/28</p>
              </div>
            </div>
            <button className="border border-primary text-primary text-sm font-semibold px-4 py-1.5 rounded-xl hover:bg-primary/5 transition-colors">
              Update
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
