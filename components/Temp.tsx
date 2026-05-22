'use client';
import SubscribeButtonHOC from "@/components/SubscribeButtonHOC"; 

const Temp = () => {
  const handleSuccess = (data: any) => { 
    console.log("Subscription successful!", data);
  };
  const handleError = (err: string | Error) => {
    console.log("Subscription error:", err);
  }
  return (
    <SubscribeButtonHOC userId={'6a02af1ac5e2677e856c0c14'} planId={'plan_SnatlA6YPaSeny'} onSuccess={handleSuccess} onError={handleError}>
  {({ onSubscribe, loading, success, error }) => (
    <button onClick={onSubscribe} disabled={loading}>
      {loading ? 'Loading…' : 'Subscribe'}
    </button>
  )}
</SubscribeButtonHOC>
  )
}

export default Temp;