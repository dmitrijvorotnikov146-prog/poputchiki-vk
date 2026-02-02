// ============================================
// VK MINI APP "ПОПУТЧИКИ" - ГОТОВОЕ ПРИЛОЖЕНИЕ
// Работает в VK и для тестирования вне VK
// ============================================

// Проверяем, находимся ли мы в VK
const isVK = typeof vkBridge !== 'undefined';

// Заглушка для тестирования вне VK
if (!isVK) {
    console.log('⚡ Режим тестирования (вне VK)');
    
    window.vkBridge = {
        send: function(method, params) {
            console.log(`[VK Bridge Mock] ${method}`, params || '');
            
            // Тестовые данные для разработки
            const mockData = {
                'VKWebAppInit': Promise.resolve(),
                'VKWebAppGetUserInfo': Promise.resolve({
                    id: 123456789,
                    first_name: 'Иван',
                    last_name: 'Петров',
                    photo_200: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop',
                    city: { id: 1, title: 'Москва' },
                    country: { id: 1, title: 'Россия' }
                }),
                'VKWebAppShowNotification': function(data) {
                    alert(`Уведомление VK: ${data.message}`);
                    return Promise.resolve();
                },
                'VKWebAppGetPhoneNumber': Promise.resolve({
                    phone_number: '+79991234567'
                }),
                'VKWebAppAllowNotifications': Promise.resolve({ enabled: true }),
                'VKWebAppAddToHomeScreen': Promise.resolve({ result: true })
            };
            
            if (mockData[method]) {
                if (typeof mockData[method] === 'function') {
                    return mockData[method](params);
                }
                return mockData[method];
            }
            
            return Promise.reject(`Метод ${method} не поддерживается в режиме тестирования`);
        }
    };
    
    // Показываем предупреждение
    document.getElementById('dev-warning').style.display = 'block';
}

// Основной объект приложения
const App = {
    // Состояние приложения
    state: {
        currentPage: 'main',
        user: null,
        filters: {
            price: 2000,
            time: 'any',
            seats: 3,
            directions: []
        },
        cities: [
            'Москва', 'Санкт-Петербург', 'Новосибирск', 'Екатеринбург', 'Казань',
            'Нижний Новгород', 'Челябинск', 'Самара', 'Омск', 'Ростов-на-Дону',
            'Уфа', 'Красноярск', 'Воронеж', 'Пермь', 'Волгоград'
        ],
        popularDirections: [
            { from: 'Москва', to: 'Санкт-Петербург', distance: '710 км', time: '8 ч' },
            { from: 'Москва', to: 'Казань', distance: '820 км', time: '10 ч' },
            { from: 'Москва', to: 'Нижний Новгород', distance: '440 км', time: '5 ч' },
            { from: 'Санкт-Петербург', to: 'Москва', distance: '710 км', time: '8 ч' },
            { from: 'Екатеринбург', to: 'Челябинск', distance: '200 км', time: '3 ч' },
            { from: 'Казань', to: 'Нижний Новгород', distance: '410 км', time: '5 ч' },
            { from: 'Новосибирск', to: 'Омск', distance: '640 км', time: '7 ч' }
        ],
        availableRides: [
            {
                id: 1,
                driver: {
                    name: 'Александр Иванов',
                    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
                    rating: 4.9,
                    rides: 156,
                    verified: true
                },
                route: {
                    from: 'Москва',
                    to: 'Санкт-Петербург',
                    date: 'Сегодня',
                    time: '18:30',
                    distance: '710 км',
                    duration: '8 часов',
                    pickup: 'м. Курская',
                    dropoff: 'м. Московская'
                },
                details: {
                    price: '2,500₽',
                    seats: 3,
                    car: 'Mercedes E-Class',
                    color: 'Черный',
                    comfort: ['Кондиционер', 'Музыка', 'Wi-Fi', 'Навигатор'],
                    amenities: ['Багаж', 'Не курю', 'Можно с животными']
                },
                type: 'comfort'
            },
            {
                id: 2,
                driver: {
                    name: 'Мария Смирнова',
                    photo: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop',
                    rating: 4.8,
                    rides: 89,
                    verified: true
                },
                route: {
                    from: 'Москва',
                    to: 'Казань',
                    date: 'Завтра',
                    time: '07:00',
                    distance: '820 км',
                    duration: '10 часов',
                    pickup: 'м. ВДНХ',
                    dropoff: 'Центр города'
                },
                details: {
                    price: '3,200₽',
                    seats: 4,
                    car: 'Toyota Camry',
                    color: 'Белый',
                    comfort: ['Кондиционер', 'Подогрев сидений'],
                    amenities: ['Багаж', 'Не курю']
                },
                type: 'standard'
            },
            {
                id: 3,
                driver: {
                    name: 'Дмитрий Петров',
                    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
                    rating: 4.7,
                    rides: 203,
                    verified: false
                },
                route: {
                    from: 'Москва',
                    to: 'Нижний Новгород',
                    date: 'Сегодня',
                    time: '22:00',
                    distance: '440 км',
                    duration: '5 часов',
                    pickup: 'м. Щелковская',
                    dropoff: 'Автовокзал'
                },
                details: {
                    price: '1,800₽',
                    seats: 4,
                    car: 'Lada Vesta',
                    color: 'Серебристый',
                    comfort: ['Музыка', 'Навигатор'],
                    amenities: ['Багаж', 'Можно курить']
                },
                type: 'economy'
            }
        ],
        myRides: [
            {
                id: 1001,
                type: 'created',
                route: {
                    from: 'Москва',
                    to: 'Санкт-Петербург',
                    date: '28 фев',
                    time: '15:00'
                },
                passengers: 3,
                status: 'active'
            },
            {
                id: 1002,
                type: 'booked',
                route: {
                    from: 'Казань',
                    to: 'Нижний Новгород',
                    date: '1 мар',
                    time: '10:00'
                },
                driver: 'Анна Козлова',
                status: 'confirmed'
            }
        ]
    },
    
    // Инициализация приложения
    async init() {
        try {
            console.log('🚀 Инициализация приложения...');
            
            // Инициализируем VK Bridge
            await vkBridge.send('VKWebAppInit');
            
            // Загружаем данные пользователя
            await this.loadUserData();
            
            // Инициализируем события
            this.initEvents();
            
            // Рендерим главную страницу
            this.renderPage('main');
            
            // Скрываем лоадер
            document.getElementById('loadingScreen').classList.add('hidden');
            
            console.log('✅ Приложение успешно инициализировано');
            
        } catch (error) {
            console.error('❌ Ошибка инициализации:', error);
            
            // Все равно показываем интерфейс
            this.renderPage('main');
            document.getElementById('loadingScreen').classList.add('hidden');
            
            this.showNotification('Приложение загружено в режиме офлайн');
        }
    },
    
    // Загрузка данных пользователя
    async loadUserData() {
        try {
            const userData = await vkBridge.send('VKWebAppGetUserInfo');
            this.state.user = userData;
            this.updateUserInfo();
        } catch (error) {
            console.warn('Не удалось загрузить данные пользователя:', error);
            // Используем тестовые данные
            this.state.user = {
                first_name: 'Гость',
                last_name: 'ВКонтакте',
                photo_200: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop',
                city: { title: 'Не указан' }
            };
            this.updateUserInfo();
        }
    },
    
    // Обновление информации о пользователе в интерфейсе
    updateUserInfo() {
        const user = this.state.user;
        if (!user) return;
        
        // Обновляем аватар
        const avatarElements = document.querySelectorAll('#userAvatar, #profileAvatar');
        avatarElements.forEach(el => {
            el.innerHTML = `<img src="${user.photo_200}" alt="${user.first_name}" 
                               style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
        });
        
        // Обновляем имя
        document.getElementById('userName').textContent = 
            `${user.first_name} ${user.last_name}`;
        
        // Обновляем рейтинг
        document.getElementById('userRating').textContent = 
            `Рейтинг: ${user.rating || '5.0'}`;
    },
    
    // Инициализация событий
    initEvents() {
        // Кнопка меню
        document.getElementById('menuBtn').addEventListener('click', () => this.openMenu());
        
        // Кнопка создания поездки
        document.getElementById('createRideBtn').addEventListener('click', () => {
            this.navigateTo('create-ride');
        });
        
        // Кнопка уведомлений
        document.getElementById('notificationBtn').addEventListener('click', () => {
            this.showNotifications();
        });
        
        // Кнопка фильтров
        document.getElementById('filterBtn').addEventListener('click', () => {
            this.openModal('filterModal');
            this.renderFilterTags();
        });
        
        // Поиск
        const searchInput = document.getElementById('globalSearch');
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.searchRides(e.target.value);
            }, 300);
        });
        
        // Ползунок цены
        document.getElementById('priceRange').addEventListener('input', (e) => {
            document.getElementById('currentPrice').textContent = e.target.value;
            this.state.filters.price = parseInt(e.target.value);
        });
        
        // Фильтры времени
        document.querySelectorAll('.time-filter').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.time-filter').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.state.filters.time = e.target.dataset.time;
            });
        });
        
        // Фильтры мест
        document.querySelectorAll('.seat-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.seat-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.state.filters.seats = parseInt(e.target.dataset.seats);
            });
        });
        
        // Закрытие модальных окон по клику на оверлей
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        });
        
        console.log('✅ События инициализированы');
    },
    
    // Навигация
    navigateTo(page) {
        this.state.currentPage = page;
        this.closeMenu();
        this.renderPage(page);
        
        // Прокрутка вверх
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    
    // Рендер страниц
    renderPage(page) {
        const container = document.getElementById('appContainer');
        
        switch(page) {
            case 'main':
                container.innerHTML = this.renderMainPage();
                this.initRideCards();
                break;
            case 'create-ride':
                container.innerHTML = this.renderCreateRidePage();
                break;
            case 'my-rides':
                container.innerHTML = this.renderMyRidesPage();
                break;
            case 'favorites':
                container.innerHTML = this.renderFavoritesPage();
                break;
            case 'history':
                container.innerHTML = this.renderHistoryPage();
                break;
            case 'profile':
                container.innerHTML = this.renderProfilePage();
                break;
            default:
                container.innerHTML = this.renderMainPage();
        }
    },
    
    // Главная страница
    renderMainPage() {
        return `
            <section class="mb-4">
                <div class="flex justify-between items-center mb-4">
                    <h2 style="font-size: 18px; font-weight: 600;">Популярные направления</h2>
                    <button onclick="App.showAllDirections()" style="background:none;border:none;color:var(--primary);font-size:14px;font-weight:500;">
                        Все
                    </button>
                </div>
                <div class="direction-tags">
                    ${this.renderPopularDirections()}
                </div>
            </section>
            
            <section>
                <div class="flex justify-between items-center mb-4">
                    <h2 style="font-size: 18px; font-weight: 600;">Доступные поездки</h2>
                    <span style="font-size:14px;color:var(--text-secondary);">
                        ${this.state.availableRides.length} поездок
                    </span>
                </div>
                
                ${this.renderRideCards()}
                
                ${this.state.availableRides.length === 0 ? `
                    <div class="text-center" style="padding:40px 20px;">
                        <span class="material-icons-round" style="font-size:64px;color:var(--text-tertiary);margin-bottom:16px;">
                            directions_car
                        </span>
                        <h3 style="margin-bottom:8px;color:var(--text-primary);">Поездок пока нет</h3>
                        <p style="color:var(--text-secondary);">Будьте первым, кто создаст поездку!</p>
                        <button class="btn-primary mt-4" onclick="App.navigateTo('create-ride')" style="width:200px;">
                            Создать поездку
                        </button>
                    </div>
                ` : ''}
            </section>
        `;
    },
    
    // Популярные направления
    renderPopularDirections() {
        return this.state.popularDirections.map(dir => `
            <div class="direction-tag" onclick="App.searchDirection('${dir.from}', '${dir.to}')">
                <span class="material-icons-round" style="font-size:16px;">directions_car</span>
                ${dir.from} → ${dir.to}
                <span style="font-size:12px;color:var(--text-tertiary);margin-left:4px;">
                    ${dir.distance}
                </span>
            </div>
        `).join('');
    },
    
    // Карточки поездок
    renderRideCards() {
        return this.state.availableRides.map(ride => `
            <div class="ride-card" data-ride-id="${ride.id}">
                <div class="ride-card-header">
                    <div class="driver-info">
                        <div class="driver-avatar">
                            <img src="${ride.driver.photo}" alt="${ride.driver.name}" 
                                 onerror="this.src='https://via.placeholder.com/200'">
                        </div>
                        <div class="driver-details">
                            <h3>${ride.driver.name}</h3>
                            <div class="driver-rating">
                                <span class="material-icons-round">star</span>
                                ${ride.driver.rating}
                                <span style="color:var(--text-secondary);margin-left:8px;">
                                    ${ride.driver.rides} поездок
                                </span>
                                ${ride.driver.verified ? 
                                    '<span class="material-icons-round" style="color:var(--success);margin-left:4px;">verified</span>' : 
                                    ''}
                            </div>
                        </div>
                    </div>
                    <div class="ride-price">
                        ${ride.details.price}
                        <small>с человека</small>
                    </div>
                </div>
                
                <div class="route-info">
                    <div class="route-line">
                        <div class="route-dot start"></div>
                        <div class="route-text">
                            <div class="route-city">${ride.route.from}</div>
                            <div class="route-time">${ride.route.date}, ${ride.route.time}</div>
                            <div style="font-size:11px;color:var(--text-tertiary);margin-top:2px;">
                                ${ride.route.pickup}
                            </div>
                        </div>
                    </div>
                    
                    <div class="route-connector"></div>
                    
                    <div class="route-line">
                        <div class="route-dot end"></div>
                        <div class="route-text">
                            <div class="route-city">${ride.route.to}</div>
                            <div class="route-time">~${ride.route.duration}</div>
                            <div style="font-size:11px;color:var(--text-tertiary);margin-top:2px;">
                                ${ride.route.dropoff}
                            </div>
                        </div>
                    </div>
                    
                    <div class="route-distance">${ride.route.distance}</div>
                </div>
                
                <div class="ride-details">
                    <div class="detail-item">
                        <span class="material-icons-round">airline_seat_recline_normal</span>
                        <span>${ride.details.seats} места</span>
                    </div>
                    <div class="detail-item">
                        <span class="material-icons-round">directions_car</span>
                        <span>${ride.details.car}</span>
                    </div>
                    <div class="detail-item">
                        <span class="material-icons-round">palette</span>
                        <span>${ride.details.color}</span>
                    </div>
                </div>
                
                <div class="flex justify-between items-center mt-4">
                    <div style="display:flex;gap:8px;flex-wrap:wrap;">
                        ${ride.details.comfort.map(item => `
                            <span style="background:var(--surface-light);padding:4px 8px;border-radius:6px;font-size:12px;color:var(--text-secondary);">
                                ${item}
                            </span>
                        `).join('')}
                    </div>
                    <button class="book-btn" onclick="App.bookRide(${ride.id}); event.stopPropagation();">
                        Забронировать
                    </button>
                </div>
            </div>
        `).join('');
    },
    
    // Инициализация кликов по карточкам
    initRideCards() {
        document.querySelectorAll('.ride-card').forEach(card => {
            const rideId = parseInt(card.dataset.rideId);
            card.addEventListener('click', () => {
                this.showRideDetails(rideId);
            });
        });
    },
    
    // Страница создания поездки
    renderCreateRidePage() {
        const today = new Date().toISOString().split('T')[0];
        const nextHour = new Date(Date.now() + 60 * 60 * 1000);
        const nextHourTime = `${String(nextHour.getHours()).padStart(2, '0')}:${String(nextHour.getMinutes()).padStart(2, '0')}`;
        
        return `
            <div class="form-container">
                <h2 style="font-size:22px;font-weight:600;margin-bottom:24px;color:var(--text-primary);">
                    <span class="material-icons-round" style="vertical-align:middle;margin-right:8px;">add_circle</span>
                    Создать поездку
                </h2>
                
                <div class="form-section">
                    <h3><span class="material-icons-round">location_on</span> Маршрут</h3>
                    <div class="flex gap-4 mb-4">
                        <div style="flex:1;">
                            <label style="display:block;margin-bottom:8px;color:var(--text-secondary);font-size:14px;">Откуда</label>
                            <select class="form-input" id="fromCity">
                                ${this.state.cities.map(city => 
                                    `<option value="${city}">${city}</option>`
                                ).join('')}
                            </select>
                        </div>
                        <div style="flex:1;">
                            <label style="display:block;margin-bottom:8px;color:var(--text-secondary);font-size:14px;">Куда</label>
                            <select class="form-input" id="toCity">
                                ${this.state.cities.map(city => 
                                    `<option value="${city}">${city}</option>`
                                ).join('')}
                            </select>
                        </div>
                    </div>
                    
                    <div>
                        <label style="display:block;margin-bottom:8px;color:var(--text-secondary);font-size:14px;">Частые маршруты</label>
                        <div class="direction-tags">
                            ${this.state.popularDirections.slice(0, 4).map(dir => `
                                <div class="direction-tag" onclick="App.setDirection('${dir.from}', '${dir.to}')">
                                    ${dir.from} → ${dir.to}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
                
                <div class="form-section">
                    <h3><span class="material-icons-round">event</span> Дата и время</h3>
                    <div class="flex gap-4">
                        <div style="flex:1;">
                            <label style="display:block;margin-bottom:8px;color:var(--text-secondary);font-size:14px;">Дата</label>
                            <input type="date" class="form-input" id="rideDate" value="${today}" min="${today}">
                        </div>
                        <div style="flex:1;">
                            <label style="display:block;margin-bottom:8px;color:var(--text-secondary);font-size:14px;">Время</label>
                            <input type="time" class="form-input" id="rideTime" value="${nextHourTime}">
                        </div>
                    </div>
                </div>
                
                <div class="form-section">
                    <h3><span class="material-icons-round">attach_money</span> Детали</h3>
                    <div class="flex gap-4 mb-4">
                        <div style="flex:1;">
                            <label style="display:block;margin-bottom:8px;color:var(--text-secondary);font-size:14px;">Цена за место (₽)</label>
                            <input type="number" class="form-input" id="ridePrice" placeholder="1500" min="0" step="100">
                        </div>
                        <div style="flex:1;">
                            <label style="display:block;margin-bottom:8px;color:var(--text-secondary);font-size:14px;">Свободных мест</label>
                            <select class="form-input" id="rideSeats">
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3" selected>3</option>
                                <option value="4">4</option>
                                <option value="5">5</option>
                                <option value="6">6</option>
                            </select>
                        </div>
                    </div>
                    
                    <div>
                        <label style="display:block;margin-bottom:8px;color:var(--text-secondary);font-size:14px;">Описание (необязательно)</label>
                        <textarea class="form-input" id="rideDescription" 
                                  placeholder="Например: еду на комфортном автомобиле, есть Wi-Fi" 
                                  rows="3" style="width:100%;resize:vertical;"></textarea>
                    </div>
                </div>
                
                <div class="form-section">
                    <h3><span class="material-icons-round">phone</span> Контакты</h3>
                    <div>
                        <label style="display:block;margin-bottom:8px;color:var(--text-secondary);font-size:14px;">Телефон для связи</label>
                        <input type="tel" class="form-input" id="ridePhone" 
                               placeholder="+7 999 123-45-67" value="${this.state.user?.phone || ''}">
                        <button onclick="App.useVKPhone()" 
                                style="margin-top:8px;background:none;border:none;color:var(--primary);font-size:14px;display:flex;align-items:center;gap:4px;">
                            <span class="material-icons-round" style="font-size:16px;">vpn_key</span>
                            Использовать номер из VK
                        </button>
                    </div>
                </div>
                
                <div class="flex gap-4 mt-4">
                    <button class="btn-secondary" onclick="App.navigateTo('main')" style="flex:1;">
                        Отмена
                    </button>
                    <button class="btn-primary" onclick="App.createNewRide()" style="flex:2;">
                        Опубликовать поездку
                    </button>
                </div>
            </div>
        `;
    },
    
    // Страница "Мои поездки"
    renderMyRidesPage() {
        return `
            <div class="form-container">
                <h2 style="font-size:22px;font-weight:600;margin-bottom:24px;">
                    <span class="material-icons-round" style="vertical-align:middle;margin-right:8px;">directions_car</span>
                    Мои поездки
                </h2>
                
                <div style="display:flex;gap:8px;margin-bottom:20px;">
                    <button class="seat-btn active" style="flex:1;">Созданные</button>
                    <button class="seat-btn" style="flex:1;">Забронированные</button>
                    <button class="seat-btn" style="flex:1;">История</button>
                </div>
                
                ${this.state.myRides.length === 0 ? `
                    <div class="text-center" style="padding:40px 20px;">
                        <span class="material-icons-round" style="font-size:64px;color:var(--text-tertiary);margin-bottom:16px;">
                            directions_car
                        </span>
                        <h3 style="margin-bottom:8px;color:var(--text-primary);">Поездок пока нет</h3>
                        <p style="color:var(--text-secondary);margin-bottom:20px;">Создайте свою первую поездку!</p>
                        <button class="btn-primary" onclick="App.navigateTo('create-ride')">
                            Создать поездку
                        </button>
                    </div>
                ` : `
                    ${this.state.myRides.map(ride => `
                        <div class="ride-card" style="cursor:default;">
                            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;">
                                <div>
                                    <h3 style="font-size:16px;font-weight:600;margin-bottom:4px;">
                                        ${ride.route.from} → ${ride.route.to}
                                    </h3>
                                    <p style="color:var(--text-secondary);font-size:14px;">
                                        ${ride.route.date}, ${ride.route.time}
                                        ${ride.driver ? `• ${ride.driver}` : ''}
                                    </p>
                                </div>
                                <div style="background:${ride.status === 'active' ? 'var(--success)' : 'var(--warning)'}; 
                                     color:white; padding:4px 12px; border-radius:12px; font-size:12px; font-weight:600;">
                                    ${ride.status === 'active' ? 'Активна' : 'Подтверждена'}
                                </div>
                            </div>
                            
                            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px;">
                                <div style="display:flex;align-items:center;gap:12px;">
                                    <span style="display:flex;align-items:center;gap:4px;color:var(--text-secondary);font-size:14px;">
                                        <span class="material-icons-round" style="font-size:18px;">people</span>
                                        ${ride.passengers || 1} пассажир${ride.passengers === 1 ? '' : 'а'}
                                    </span>
                                </div>
                                <div>
                                    <button class="btn-secondary" style="padding:8px 16px;font-size:14px;" 
                                            onclick="App.showNotification('Детали поездки')">
                                        Подробнее
                                    </button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                `}
            </div>
        `;
    },
    
    // Остальные страницы
    renderFavoritesPage() {
        return `
            <div class="form-container">
                <h2 style="font-size:22px;font-weight:600;margin-bottom:24px;">
                    <span class="material-icons-round" style="vertical-align:middle;margin-right:8px;">favorite</span>
                    Избранное
                </h2>
                <div class="text-center" style="padding:40px 20px;">
                    <span class="material-icons-round" style="font-size:64px;color:var(--text-tertiary);margin-bottom:16px;">
                        favorite_border
                    </span>
                    <h3 style="margin-bottom:8px;color:var(--text-primary);">Пока пусто</h3>
                    <p style="color:var(--text-secondary);">Добавляйте сюда любимых водителей и маршруты</p>
                </div>
            </div>
        `;
    },
    
    renderHistoryPage() {
        return `
            <div class="form-container">
                <h2 style="font-size:22px;font-weight:600;margin-bottom:24px;">
                    <span class="material-icons-round" style="vertical-align:middle;margin-right:8px;">history</span>
                    История поездок
                </h2>
                <div class="text-center" style="padding:40px 20px;">
                    <span class="material-icons-round" style="font-size:64px;color:var(--text-tertiary);margin-bottom:16px;">
                        history
                    </span>
                    <h3 style="margin-bottom:8px;color:var(--text-primary);">История пуста</h3>
                    <p style="color:var(--text-secondary);">Здесь появятся ваши завершенные поездки</p>
                </div>
            </div>
        `;
    },
    
    renderProfilePage() {
        const user = this.state.user;
        return `
            <div class="form-container">
                <div style="text-align:center;margin-bottom:32px;">
                    <div class="driver-avatar" style="width:100px;height:100px;margin:0 auto 16px;">
                        <img src="${user?.photo_200 || 'https://via.placeholder.com/200'}" alt="${user?.first_name}">
                    </div>
                    <h2 style="font-size:24px;margin-bottom:4px;">${user?.first_name || ''} ${user?.last_name || ''}</h2>
                    <p style="color:var(--text-secondary);">${user?.city?.title || 'Город не указан'}</p>
                </div>
                
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:32px;">
                    <div style="text-align:center;">
                        <div style="font-size:24px;font-weight:700;color:var(--primary);">${this.state.myRides.length}</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Поездок</div>
                    </div>
                    <div style="text-align:center;">
                        <div style="font-size:24px;font-weight:700;color:var(--primary);">4.8</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Рейтинг</div>
                    </div>
                    <div style="text-align:center;">
                        <div style="font-size:24px;font-weight:700;color:var(--primary);">12</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Отзывов</div>
                    </div>
                </div>
                
                <div style="margin-bottom:24px;">
                    <h3 style="margin-bottom:16px;font-size:18px;">Статистика</h3>
                    <div style="background:var(--surface-light);border-radius:12px;padding:16px;">
                        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                            <span style="color:var(--text-secondary);">Популярный маршрут:</span>
                            <span>Москва → Санкт-Петербург</span>
                        </div>
                        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                            <span style="color:var(--text-secondary);">Всего км:</span>
                            <span>2,458 км</span>
                        </div>
                        <div style="display:flex;justify-content:space-between;">
                            <span style="color:var(--text-secondary);">Экономия:</span>
                            <span style="color:var(--success);font-weight:600;">12,450₽</span>
                        </div>
                    </div>
                </div>
                
                <div style="display:flex;flex-direction:column;gap:12px;">
                    <button class="btn-secondary" onclick="App.showNotification('Настройки в разработке')">
                        <span class="material-icons-round" style="vertical-align:middle;margin-right:8px;">settings</span>
                        Настройки
                    </button>
                    
                    <button class="btn-secondary" onclick="App.showNotification('О приложении')">
                        <span class="material-icons-round" style="vertical-align:middle;margin-right:8px;">info</span>
                        О приложении
                    </button>
                    
                    <button class="btn-secondary" onclick="App.logout()" style="color:#d32f2f;">
                        <span class="material-icons-round" style="vertical-align:middle;margin-right:8px;">logout</span>
                        Выйти
                    </button>
                </div>
            </div>
        `;
    },
    
    // Работа с направлениями
    setDirection(from, to) {
        document.getElementById('fromCity').value = from;
        document.getElementById('toCity').value = to;
        this.showNotification(`Маршрут: ${from} → ${to}`);
    },
    
    searchDirection(from, to) {
        document.getElementById('globalSearch').value = `${from} → ${to}`;
        const results = this.state.availableRides.filter(ride => 
            ride.route.from === from && ride.route.to === to
        );
        this.showSearchResults(results, `Маршрут: ${from} → ${to}`);
    },
    
    showAllDirections() {
        this.openModal('filterModal');
    },
    
    renderFilterTags() {
        const container = document.getElementById('directionTags');
        container.innerHTML = this.state.cities.map(city => `
            <div class="direction-tag ${this.state.filters.directions.includes(city) ? 'active' : ''}" 
                 onclick="App.toggleFilterTag('${city}')">
                ${city}
            </div>
        `).join('');
    },
    
    toggleFilterTag(city) {
        const index = this.state.filters.directions.indexOf(city);
        if (index === -1) {
            this.state.filters.directions.push(city);
        } else {
            this.state.filters.directions.splice(index, 1);
        }
        this.renderFilterTags();
    },
    
    // Поиск
    searchRides(query) {
        if (!query.trim()) {
            this.renderPage('main');
            return;
        }
        
        const results = this.state.availableRides.filter(ride => 
            ride.route.from.toLowerCase().includes(query.toLowerCase()) ||
            ride.route.to.toLowerCase().includes(query.toLowerCase()) ||
            ride.driver.name.toLowerCase().includes(query.toLowerCase()) ||
            ride.details.car.toLowerCase().includes(query.toLowerCase()) ||
            `${ride.route.from} → ${ride.route.to}`.toLowerCase().includes(query.toLowerCase())
        );
        
        this.showSearchResults(results, `Результаты по запросу: "${query}"`);
    },
    
    showSearchResults(results, title = 'Результаты поиска') {
        const container = document.getElementById('appContainer');
        
        if (results.length === 0) {
            container.innerHTML = `
                <div style="margin-bottom:20px;">
                    <button class="icon-btn" onclick="App.navigateTo('main')" 
                            style="background:var(--surface);color:var(--text-primary);">
                        <span class="material-icons-round">arrow_back</span>
                    </button>
                    <span style="margin-left:12px;font-weight:600;">${title}</span>
                </div>
                
                <div class="text-center" style="padding:60px 20px;">
                    <span class="material-icons-round" style="font-size:64px;color:var(--text-tertiary);margin-bottom:16px;">
                        search_off
                    </span>
                    <h3 style="margin-bottom:8px;color:var(--text-primary);">Ничего не найдено</h3>
                    <p style="color:var(--text-secondary);margin-bottom:20px;">Попробуйте изменить запрос или фильтры</p>
                    <button class="btn-primary" onclick="App.openModal('filterModal')">
                        Открыть фильтры
                    </button>
                </div>
            `;
            return;
        }
        
        container.innerHTML = `
            <div style="margin-bottom:20px;">
                <button class="icon-btn" onclick="App.navigateTo('main')" 
                        style="background:var(--surface);color:var(--text-primary);">
                    <span class="material-icons-round">arrow_back</span>
                </button>
                <span style="margin-left:12px;font-weight:600;">${title} (${results.length})</span>
            </div>
            
            ${results.map(ride => `
                <div class="ride-card" onclick="App.showRideDetails(${ride.id})">
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                        <div>
                            <h3 style="margin-bottom:4px;font-size:16px;">${ride.route.from} → ${ride.route.to}</h3>
                            <p style="color:var(--text-secondary);font-size:14px;">
                                ${ride.route.date}, ${ride.route.time} • ${ride.driver.name}
                            </p>
                        </div>
                        <div class="ride-price" style="font-size:20px;">${ride.details.price}</div>
                    </div>
                </div>
            `).join('')}
        `;
    },
    
    // Модальные окна
    openModal(modalId) {
        document.getElementById(modalId).style.display = 'flex';
    },
    
    closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
    },
    
    openMenu() {
        document.getElementById('sideMenu').style.display = 'block';
        setTimeout(() => {
            document.getElementById('sideMenu').style.opacity = '1';
        }, 10);
    },
    
    closeMenu() {
        document.getElementById('sideMenu').style.display = 'none';
    },
    
    // Фильтры
    applyFilters() {
        this.closeModal('filterModal');
        this.showNotification('Фильтры применены');
        // Здесь можно добавить реальную фильтрацию
    },
    
    resetFilters() {
        this.state.filters = {
            price: 2000,
            time: 'any',
            seats: 3,
            directions: []
        };
        document.getElementById('priceRange').value = 2000;
        document.getElementById('currentPrice').textContent = '2000';
        document.querySelectorAll('.time-filter')[0].click();
        document.querySelectorAll('.seat-btn')[2].click();
        this.renderFilterTags();
        this.showNotification('Фильтры сброшены');
    },
    
    // Работа с VK API
    async useVKPhone() {
        try {
            const phoneData = await vkBridge.send('VKWebAppGetPhoneNumber');
            if (phoneData.phone_number) {
                document.getElementById('ridePhone').value = phoneData.phone_number;
                this.showNotification('Номер из VK добавлен');
            }
        } catch (error) {
            console.warn('Не удалось получить номер из VK:', error);
            this.showNotification('Разрешите доступ к номеру в настройках VK');
        }
    },
    
    // Создание поездки
    createNewRide() {
        const from = document.getElementById('fromCity').value;
        const to = document.getElementById('toCity').value;
        const date = document.getElementById('rideDate').value;
        const time = document.getElementById('rideTime').value;
        const price = document.getElementById('ridePrice').value;
        const seats = document.getElementById('rideSeats').value;
        const phone = document.getElementById('ridePhone').value;
        const description = document.getElementById('rideDescription').value;
        
        // Валидация
        if (!from || !to) {
            this.showNotification('Укажите города отправления и назначения');
            return;
        }
        
        if (!price || price < 0) {
            this.showNotification('Укажите корректную цену');
            return;
        }
        
        if (!seats || seats < 1 || seats > 6) {
            this.showNotification('Укажите количество мест от 1 до 6');
            return;
        }
        
        if (from === to) {
            this.showNotification('Города отправления и назначения не должны совпадать');
            return;
        }
        
        // Форматирование даты
        const rideDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let dateText;
        if (rideDate.toDateString() === today.toDateString()) {
            dateText = 'Сегодня';
        } else {
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            if (rideDate.toDateString() === tomorrow.toDateString()) {
                dateText = 'Завтра';
            } else {
                dateText = rideDate.toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'long'
                });
            }
        }
        
        // Создание новой поездки
        const newRide = {
            id: Date.now(),
            driver: {
                name: this.state.user ? `${this.state.user.first_name} ${this.state.user.last_name}` : 'Вы',
                photo: this.state.user?.photo_200 || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop',
                rating: 5.0,
                rides: 1,
                verified: true
            },
            route: {
                from,
                to,
                date: dateText,
                time: time,
                distance: 'Расчет...',
                duration: '...',
                pickup: 'Уточнить у водителя',
                dropoff: 'По договоренности'
            },
            details: {
                price: `${parseInt(price).toLocaleString('ru-RU')}₽`,
                seats: parseInt(seats),
                car: 'Ваш автомобиль',
                color: 'Не указан',
                comfort: description ? ['Описание: ' + description] : ['По договоренности'],
                amenities: ['По договоренности']
            },
            type: 'standard'
        };
        
        // Добавляем в начало списка
        this.state.availableRides.unshift(newRide);
        
        // Добавляем в "Мои поездки"
        this.state.myRides.unshift({
            id: newRide.id,
            type: 'created',
            route: {
                from,
                to,
                date: dateText,
                time: time
            },
            passengers: 0,
            status: 'active'
        });
        
        // Обновляем бейдж
        const badge = document.querySelector('.menu-item[onclick*="my-rides"] .badge');
        if (badge) {
            const current = parseInt(badge.textContent) || 0;
            badge.textContent = current + 1;
        }
        
        this.showNotification('Поездка успешно создана!');
        this.navigateTo('main');
        
        // Имитируем уведомления другим пользователям
        setTimeout(() => {
            this.showNotification('На вашу поездку уже есть отклики!');
        }, 2000);
    },
    
    // Показать детали поездки
    showRideDetails(rideId) {
        const ride = this.state.availableRides.find(r => r.id === rideId);
        if (!ride) return;
        
        const modalContent = document.querySelector('#rideDetailsModal .modal-content');
        modalContent.innerHTML = `
            <div class="modal-header">
                <h2>Детали поездки</h2>
                <button class="icon-btn close-modal" onclick="App.closeModal('rideDetailsModal')">
                    <span class="material-icons-round">close</span>
                </button>
            </div>
            <div class="modal-body">
                <div style="text-align:center;margin-bottom:24px;">
                    <div class="driver-avatar" style="width:80px;height:80px;margin:0 auto 16px;">
                        <img src="${ride.driver.photo}" alt="${ride.driver.name}" 
                             onerror="this.src='https://via.placeholder.com/200'">
                    </div>
                    <h3 style="margin-bottom:4px;font-size:18px;">${ride.driver.name}</h3>
                    <div style="color:var(--text-secondary);font-size:14px;">
                        ${ride.driver.rating} ★ • ${ride.driver.rides} поездок
                        ${ride.driver.verified ? 
                            '• <span style="color:var(--success);">Проверен VK</span>' : 
                            ''}
                    </div>
                </div>
                
                <div style="background:var(--surface-light);border-radius:12px;padding:16px;margin-bottom:20px;">
                    <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
                        <span style="color:var(--text-secondary);">Маршрут:</span>
                        <span style="font-weight:600;color:var(--primary);">${ride.route.from} → ${ride.route.to}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
                        <span style="color:var(--text-secondary);">Дата и время:</span>
                        <span>${ride.route.date}, ${ride.route.time}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
                        <span style="color:var(--text-secondary);">Расстояние:</span>
                        <span>${ride.route.distance} • ${ride.route.duration}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;">
                        <span style="color:var(--text-secondary);">Места посадки/высадки:</span>
                        <span style="text-align:right;">
                            ${ride.route.pickup}<br>
                            ↓<br>
                            ${ride.route.dropoff}
                        </span>
                    </div>
                </div>
                
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
                    <div>
                        <div style="font-size:14px;color:var(--text-secondary);">Автомобиль</div>
                        <div style="font-weight:600;font-size:16px;">
                            ${ride.details.car} • ${ride.details.color}
                        </div>
                    </div>
                    <div style="font-size:32px;font-weight:700;color:var(--primary);">
                        ${ride.details.price}
                    </div>
                </div>
                
                <div style="margin-bottom:20px;">
                    <div style="font-size:14px;color:var(--text-secondary);margin-bottom:8px;">Удобства в поездке:</div>
                    <div style="display:flex;flex-wrap:wrap;gap:8px;">
                        ${ride.details.comfort.map(item => `
                            <span style="background:var(--surface-light);padding:6px 12px;border-radius:20px;font-size:14px;">
                                ${item}
                            </span>
                        `).join('')}
                    </div>
                </div>
                
                <div style="margin-bottom:24px;">
                    <div style="font-size:14px;color:var(--text-secondary);margin-bottom:8px;">Особые условия:</div>
                    <div style="display:flex;flex-wrap:wrap;gap:8px;">
                        ${ride.details.amenities.map(item => `
                            <span style="background:var(--surface-light);padding:6px 12px;border-radius:20px;font-size:14px;">
                                ${item}
                            </span>
                        `).join('')}
                    </div>
                </div>
                
                <button class="btn-primary" style="width:100%;margin-bottom:12px;" 
                        onclick="App.bookRide(${ride.id}); App.closeModal('rideDetailsModal');">
                    <span class="material-icons-round" style="vertical-align:middle;margin-right:8px;">check_circle</span>
                    Забронировать место
                </button>
                
                <button class="btn-secondary" style="width:100%;" onclick="App.addToFavorites(${ride.id})">
                    <span class="material-icons-round" style="vertical-align:middle;margin-right:8px;">favorite</span>
                    Добавить в избранное
                </button>
            </div>
        `;
        
        this.openModal('rideDetailsModal');
    },
    
    // Бронирование поездки
    bookRide(rideId) {
        const ride = this.state.availableRides.find(r => r.id === rideId);
        if (!ride) return;
        
        if (ride.details.seats <= 0) {
            this.showNotification('К сожалению, все места уже заняты');
            return;
        }
        
        // Уменьшаем количество свободных мест
        ride.details.seats -= 1;
        
        // Добавляем в "Мои поездки"
        this.state.myRides.push({
            id: Date.now(),
            type: 'booked',
            route: {
                from: ride.route.from,
                to: ride.route.to,
                date: ride.route.date,
                time: ride.route.time
            },
            driver: ride.driver.name,
            status: 'confirmed'
        });
        
        // Обновляем бейдж
        const badge = document.querySelector('.menu-item[onclick*="my-rides"] .badge');
        if (badge) {
            const current = parseInt(badge.textContent) || 0;
            badge.textContent = current + 1;
        }
        
        this.showNotification(`Вы забронировали место у ${ride.driver.name}!`);
        
        // Обновляем интерфейс
        if (this.state.currentPage === 'main') {
            this.renderPage('main');
        }
    },
    
    // Добавление в избранное
    addToFavorites(rideId) {
        this.showNotification('Добавлено в избранное');
        this.closeModal('rideDetailsModal');
    },
    
    // Уведомления
    showNotification(message) {
        vkBridge.send('VKWebAppShowNotification', {
            message: message
        }).catch(error => {
            console.log('VK уведомление (тест):', message);
            // Fallback для тестирования
            if (!isVK) {
                alert(message);
            }
        });
    },
    
    showNotifications() {
        this.showNotification('У вас 3 новых уведомления о поездках');
    },
    
    // Прочие функции
    logout() {
        this.showNotification('Вы вышли из аккаунта');
        this.navigateTo('main');
    }
};

// Делаем App глобально доступным
window.App = App;

// Автоматический запуск при загрузке страницы
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
} else {
    App.init();
}