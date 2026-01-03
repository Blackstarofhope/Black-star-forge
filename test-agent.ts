/**
 * Test script for the Black Star Autonomous Agent
 * Run with: npx tsx test-agent.ts
 */

import 'dotenv/config';

async function testAgent() {
  console.log('🌟 Testing Black Star Autonomous Agent\n');

  const baseUrl = process.env.BASE_URL || 'http://localhost:5000';

  // Test 1: Health Check
  console.log('1️⃣ Testing health endpoint...');
  try {
    const healthResponse = await fetch(`${baseUrl}/api/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check passed:', healthData);
  } catch (error) {
    console.error('❌ Health check failed:', error);
    console.error('Make sure the server is running: npm run dev');
    process.exit(1);
  }

  // Test 2: Submit Order
  console.log('\n2️⃣ Submitting test order...');
  try {
    const orderResponse = await fetch(`${baseUrl}/api/receive-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        project_name: 'Test Landing Page',
        requirements: 'Create a simple HTML landing page with a hero section, features section, and a contact form. Use modern CSS styling.'
      })
    });

    const orderData = await orderResponse.json();
    console.log('✅ Order submitted:', orderData);

    if (orderData.success && orderData.orderId) {
      const orderId = orderData.orderId;

      // Wait a bit for processing
      console.log('\n⏳ Waiting 5 seconds for initial processing...');
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Test 3: Check Status
      console.log('\n3️⃣ Checking project status...');
      const statusResponse = await fetch(`${baseUrl}/api/project-status/${orderId}`);
      const statusData = await statusResponse.json();
      console.log('✅ Project status:', statusData);

      // Test 4: Get Statistics
      console.log('\n4️⃣ Getting agent statistics...');
      const statsResponse = await fetch(`${baseUrl}/api/statistics`);
      const statsData = await statsResponse.json();
      console.log('✅ Statistics:', statsData);

      console.log('\n✨ All tests passed!');
      console.log(`\n📊 Monitor your project: ${baseUrl}/api/project-status/${orderId}`);
      console.log(`\n📧 The agent will email you when the project is ready for approval.`);
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run tests
testAgent().catch(console.error);
