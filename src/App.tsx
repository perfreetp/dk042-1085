import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import Dashboard from '@/pages/Dashboard';
import HealthRecords from '@/pages/HealthRecords';
import ServiceBooking from '@/pages/ServiceBooking';
import Notifications from '@/pages/Notifications';
import Billing from '@/pages/Billing';
import Authorization from '@/pages/Authorization';

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/health" element={<HealthRecords />} />
          <Route path="/services" element={<ServiceBooking />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="/authorization" element={<Authorization />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </Layout>
    </Router>
  );
}
