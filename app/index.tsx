
import { Redirect } from 'expo-router';

export default function Index() {
  // Redirect to the course page (WebView) as the default landing page
  return <Redirect href="/(tabs)/course" />;
}
