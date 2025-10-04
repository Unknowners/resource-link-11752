export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">1. Information We Collect</h2>
            <p>
              When you connect your Notion workspace to our application, we collect and process:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Your Notion account information (name, email)</li>
              <li>Access to pages and databases you grant permission to</li>
              <li>Metadata about your Notion workspace</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">2. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Provide access management and resource synchronization</li>
              <li>Display your Notion pages within our application</li>
              <li>Maintain and improve our services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">3. Data Storage and Security</h2>
            <p>
              Your data is stored securely using industry-standard encryption. We implement appropriate 
              technical and organizational measures to protect your information against unauthorized access, 
              alteration, disclosure, or destruction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">4. Data Sharing</h2>
            <p>
              We do not sell, trade, or rent your personal information to third parties. Your Notion data 
              is only accessed to provide the services you've requested.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">5. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Access your personal data</li>
              <li>Request correction of your data</li>
              <li>Request deletion of your data</li>
              <li>Revoke integration access at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">6. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at the email 
              address provided in your integration settings.
            </p>
          </section>

          <p className="text-sm mt-8">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>
      </div>
    </div>
  );
}
