export default function TermsOfUse() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Terms of Use</h1>
        
        <div className="space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
            <p>
              By connecting your Notion workspace to our application, you agree to be bound by these 
              Terms of Use. If you do not agree to these terms, please do not use our integration.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">2. Service Description</h2>
            <p>
              Our Notion integration provides access management and resource synchronization capabilities, 
              allowing you to manage and control access to your Notion workspace content within our platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">3. User Responsibilities</h2>
            <p>You agree to:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Use the integration in compliance with Notion's Terms of Service</li>
              <li>Not use the service for any unlawful purposes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">4. Permissions and Access</h2>
            <p>
              You grant us permission to access your Notion workspace data as necessary to provide our 
              services. You can revoke this access at any time by disconnecting the integration.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">5. Limitation of Liability</h2>
            <p>
              The integration is provided "as is" without warranties of any kind. We are not liable for 
              any damages arising from your use of the integration, including but not limited to data 
              loss or service interruptions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">6. Termination</h2>
            <p>
              We reserve the right to terminate or suspend access to our integration at any time, with 
              or without cause. You may terminate your use of the integration at any time by disconnecting 
              it from your Notion workspace.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">7. Changes to Terms</h2>
            <p>
              We may modify these terms at any time. Continued use of the integration after changes 
              constitutes acceptance of the modified terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">8. Contact Information</h2>
            <p>
              For questions about these Terms of Use, please contact us at the email address provided 
              in your integration settings.
            </p>
          </section>

          <p className="text-sm mt-8">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>
      </div>
    </div>
  );
}
