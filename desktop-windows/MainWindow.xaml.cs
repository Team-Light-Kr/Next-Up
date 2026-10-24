using System;
using System.Diagnostics;
using System.IO;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Input;
using Microsoft.Web.WebView2.Core;

namespace NextUps
{
    public partial class MainWindow : Window
    {
        private const string CurrentAppVersion = "1.0.0";
        private const string PrimaryUrl = "http://localhost:3000";
        private const string FallbackUrl = "https://www.nextups.xyz";
        private string? _pendingUpdateUrl = null;

        public MainWindow()
        {
            InitializeComponent();
            Loaded += MainWindow_Loaded;
            StateChanged += MainWindow_StateChanged;
        }

        private async void MainWindow_Loaded(object sender, RoutedEventArgs e)
        {
            await InitializeWebViewAsync();
            _ = CheckForUpdatesAsync();
        }

        private async Task InitializeWebViewAsync()
        {
            try
            {
                var userDataFolder = Path.Combine(
                    Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                    "NextUps",
                    "WebView2Data"
                );
                Directory.CreateDirectory(userDataFolder);

                var env = await CoreWebView2Environment.CreateAsync(null, userDataFolder);
                await webView.EnsureCoreWebView2Async(env);

                webView.CoreWebView2.Settings.IsStatusBarEnabled = false;
                webView.CoreWebView2.Settings.AreDevToolsEnabled = true;
                webView.CoreWebView2.NavigationCompleted += (s, args) =>
                {
                    LoadingOverlay.Visibility = Visibility.Collapsed;
                };

                // Navigate to service
                webView.Source = new Uri(PrimaryUrl);
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"WebView2 initialization failed: {ex.Message}");
                // Fallback direct load
                webView.Source = new Uri(FallbackUrl);
                LoadingOverlay.Visibility = Visibility.Collapsed;
            }
        }

        private async Task CheckForUpdatesAsync()
        {
            try
            {
                using var client = new HttpClient { Timeout = TimeSpan.FromSeconds(5) };
                var apiUrl = $"{PrimaryUrl}/api/app/update?platform=windows&version={CurrentAppVersion}";
                
                string json;
                try
                {
                    json = await client.GetStringAsync(apiUrl);
                }
                catch
                {
                    json = await client.GetStringAsync($"{FallbackUrl}/api/app/update?platform=windows&version={CurrentAppVersion}");
                }

                using var doc = JsonDocument.Parse(json);
                var root = doc.RootElement;
                if (root.TryGetProperty("hasUpdate", out var hasUpdateProp) && hasUpdateProp.GetBoolean())
                {
                    var latestVer = root.GetProperty("latestVersion").GetString();
                    _pendingUpdateUrl = root.GetProperty("downloadUrl").GetString();

                    Dispatcher.Invoke(() =>
                    {
                        UpdateBannerText.Text = $"v{latestVer} 업데이트가 준비되었습니다. 향상된 기능과 안정성을 경험해 보세요.";
                        UpdateBanner.Visibility = Visibility.Visible;
                    });
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Update check error: {ex.Message}");
            }
        }

        private void TitleBar_MouseLeftButtonDown(object sender, MouseButtonEventArgs e)
        {
            if (e.ClickCount == 2)
            {
                ToggleMaximize();
            }
            else
            {
                DragMove();
            }
        }

        private void Reload_Click(object sender, RoutedEventArgs e)
        {
            webView.Reload();
        }

        private void Minimize_Click(object sender, RoutedEventArgs e)
        {
            WindowState = WindowState.Minimized;
        }

        private void Maximize_Click(object sender, RoutedEventArgs e)
        {
            ToggleMaximize();
        }

        private void Close_Click(object sender, RoutedEventArgs e)
        {
            Close();
        }

        private void ToggleMaximize()
        {
            WindowState = WindowState == WindowState.Maximized ? WindowState.Normal : WindowState.Maximized;
        }

        private void MainWindow_StateChanged(object? sender, EventArgs e)
        {
            if (MaximizeButtonText != null)
            {
                MaximizeButtonText.Text = WindowState == WindowState.Maximized ? "❐" : "□";
            }
        }

        private void InstallUpdate_Click(object sender, RoutedEventArgs e)
        {
            if (!string.IsNullOrEmpty(_pendingUpdateUrl))
            {
                try
                {
                    Process.Start(new ProcessStartInfo
                    {
                        FileName = _pendingUpdateUrl,
                        UseShellExecute = true
                    });
                }
                catch (Exception ex)
                {
                    MessageBox.Show($"업데이트 다운로드 링크 열기 실패: {ex.Message}", "NextUps 업데이트", MessageBoxButton.OK, MessageBoxImage.Warning);
                }
            }
        }

        private void DismissUpdate_Click(object sender, RoutedEventArgs e)
        {
            UpdateBanner.Visibility = Visibility.Collapsed;
        }
    }
}