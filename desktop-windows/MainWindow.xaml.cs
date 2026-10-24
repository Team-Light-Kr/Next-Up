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

        private async void InstallUpdate_Click(object sender, RoutedEventArgs e)
        {
            if (string.IsNullOrEmpty(_pendingUpdateUrl)) return;

            string downloadUrl = _pendingUpdateUrl;
            if (downloadUrl.EndsWith("/download"))
            {
                downloadUrl = $"{FallbackUrl}/api/download?file=exe";
            }

            try
            {
                UpdateDownloadButton.IsEnabled = false;
                UpdateDownloadButtonText.Text = "다운로드 중...";
                UpdateProgressGrid.Visibility = Visibility.Visible;
                UpdateBannerText.Text = "새 버전 설치 프로그램을 안전하게 다운로드하고 있습니다...";

                string tempFile = Path.Combine(Path.GetTempPath(), "NextUps-Setup-Latest.exe");

                using var handler = new HttpClientHandler { AllowAutoRedirect = true };
                using var client = new HttpClient(handler);
                client.Timeout = TimeSpan.FromMinutes(10);

                using var response = await client.GetAsync(downloadUrl, HttpCompletionOption.ResponseHeadersRead);
                response.EnsureSuccessStatusCode();

                long? totalBytes = response.Content.Headers.ContentLength;
                using var stream = await response.Content.ReadAsStreamAsync();
                using var fileStream = new FileStream(tempFile, FileMode.Create, FileAccess.Write, FileShare.None, 81920, true);

                var buffer = new byte[81920];
                long totalRead = 0;
                int read;
                var stopwatch = Stopwatch.StartNew();

                while ((read = await stream.ReadAsync(buffer, 0, buffer.Length)) > 0)
                {
                    await fileStream.WriteAsync(buffer, 0, read);
                    totalRead += read;

                    if (totalBytes.HasValue && totalBytes.Value > 0)
                    {
                        double percent = Math.Round((double)totalRead / totalBytes.Value * 100, 1);
                        double downloadedMB = totalRead / (1024.0 * 1024.0);
                        double totalMB = totalBytes.Value / (1024.0 * 1024.0);
                        double speedMB = downloadedMB / Math.Max(0.1, stopwatch.Elapsed.TotalSeconds);

                        Dispatcher.Invoke(() =>
                        {
                            UpdateProgressBar.Value = percent;
                            UpdateProgressPercent.Text = $"{percent:F0}%";
                            UpdateBannerText.Text = $"다운로드 진행 중... {downloadedMB:F1}MB / {totalMB:F1}MB ({percent:F0}%) • {speedMB:F1}MB/s";
                        });
                    }
                }

                fileStream.Close();

                Dispatcher.Invoke(() =>
                {
                    UpdateProgressBar.Value = 100;
                    UpdateProgressPercent.Text = "100%";
                    UpdateBannerText.Text = "다운로드 완료! 설치 프로그램을 실행합니다...";
                });

                await Task.Delay(600);

                // Run the downloaded installer
                Process.Start(new ProcessStartInfo
                {
                    FileName = tempFile,
                    UseShellExecute = true
                });

                // Exit running app so installer can overwrite files cleanly
                Application.Current.Shutdown();
            }
            catch (Exception ex)
            {
                Dispatcher.Invoke(() =>
                {
                    UpdateDownloadButton.IsEnabled = true;
                    UpdateDownloadButtonText.Text = "다시 시도";
                    UpdateProgressGrid.Visibility = Visibility.Collapsed;
                    UpdateBannerText.Text = $"다운로드 실패: {ex.Message}";
                });
            }
        }


        private void DismissUpdate_Click(object sender, RoutedEventArgs e)
        {
            UpdateBanner.Visibility = Visibility.Collapsed;
        }
    }
}